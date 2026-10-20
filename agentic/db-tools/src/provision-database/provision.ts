// Provisioning a project's database without ever creating a second one by
// accident. Every step runs under a per-project lock, and:
//  - a binding is DATABASE_ID alone: it is probed, then kept (and healed) or
//    refused, never provisioned over;
//  - replace mode swaps a binding only if it is still the one the caller saw,
//    and never one that is live (host path) or suspended;
//  - a recorded ticket that reads back empty, or a call that lost its ticket,
//    finds an in-flight provision of the same name before anything new is
//    requested, and a completed one is only reported (binding it is `adopt`);
//  - the host saves the binding before `.env` is written.

import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { prewarmAppWorkspace, run, type RunCommand } from '../app-workspace';
import { type DatabaseProbe, probeDatabase } from '../db-probe';
import { getHost, type ProjectBinding, reprovisionAdvice, type ToolsHost } from '../host';
import { selectProvisionCredential } from './credential';
import { archiveBindingKeys, ARCHIVED_BINDING_KEYS, type EnvVars, mergeEnv, provisionEnvVars, readEnv } from './env-file';
import { loadProvisionManifest } from './manifest';
import {
  abandonedTickets,
  archivePendingTicket,
  clearPendingTicket,
  MAX_PENDING_ATTEMPTS,
  type PendingTicket,
  recordAbandoned,
  recordedTicket,
  recordPendingTicket,
} from './pending-ticket';
import { selectProvisionRequest } from './preset-match';
import {
  createProvisionExecutor,
  isTicketInFlight,
  isTransientProvisionError,
  ProvisionPendingError,
  type ProvisionRequestExecutor,
  type ProvisionTicket,
  ProvisionTicketLostError,
  requestDatabaseProvision,
} from './request-database';
import { type ProvisionOverlay, resolveProvisionModules } from './resolve';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';
const DEFAULT_MODULES_ENDPOINT = 'http://modules.localhost:3000/graphql';

export type ProvisionInput = {
  databaseName: string;
  /** `ensure` keeps a live binding; `replace` swaps the binding for a new database. */
  mode?: 'ensure' | 'replace';
  /**
   * Replace mode: the DATABASE_ID the caller expects bound (null: none). Any
   * other binding fails `binding-changed`. Undefined replaces whatever is bound.
   */
  replaces?: string | null;
  /** Host only: stop following an in-flight provision and request a new one. */
  abandonPending?: boolean;
  /**
   * Host only: bind this database, which the signed-in account owns and is
   * active, without requesting one (recovery after `name-taken`).
   */
  adopt?: string;
};

export type ProvisionFailureCode =
  | 'signed-out'
  | 'backend-unreachable'
  | 'db-missing'
  | 'db-suspended'
  | 'account-mismatch'
  | 'binding-live'
  | 'binding-changed'
  | 'pending-other'
  | 'ticket-lost'
  | 'provision-stuck'
  | 'name-taken'
  | 'binding-not-saved'
  | 'env-write-failed'
  | 'reprovision-not-allowed'
  | 'failed';

export type ProvisionDatabaseDetails = {
  success: boolean;
  message: string;
  /** Why it failed; absent on success and on a pending result. */
  code?: ProvisionFailureCode;
  databaseId?: string;
  databaseName?: string;
  ownerId?: string;
  /** True when an existing live binding was kept: nothing changed. */
  skipped?: boolean;
  /**
   * True when the call stopped waiting while the provision is still running.
   * Calling again with the same database_name resumes it.
   */
  pending?: boolean;
  /** The provision ticket, on a pending or stuck result. */
  ticketId?: string;
  /** True when this call finished a provision an earlier call had started. */
  resumed?: boolean;
  /** True when that provision was found on the backend by name, not in `.env`. */
  recovered?: boolean;
  /** The database the new binding replaced (replace mode). */
  replaced?: string;
  /** With `name-taken`: a database of this account holds the name. Never bound automatically. */
  heldBy?: { databaseId: string; yours: boolean; createdAt?: string };
};

type Details = ProvisionDatabaseDetails;

function failure(code: ProvisionFailureCode, message: string, extra: Partial<Details> = {}): Details {
  return { ...extra, success: false, message, code };
}

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));
const today = () => new Date().toISOString().slice(0, 10);
const noop = (): void => undefined;

async function readText(file: string): Promise<string> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

// Edit .env from its current content, read right before the write, so changes
// made while this call waited on the backend (by another tool or the user)
// aren't overwritten with what the file held when the call started.
async function updateEnvFile(envPath: string, edit: (content: string) => string): Promise<void> {
  await writeFile(envPath, edit(await readText(envPath)));
}

/** The DATABASE_ID in a project's `.env`, if any. */
export async function boundDatabaseId(cwd: string): Promise<string | undefined> {
  return readEnv(await readText(path.join(cwd, '.env'))).DATABASE_ID || undefined;
}

// The per-DB endpoints are subdomain.<domain>; the provisioning domain is the api
// endpoint's host minus its first label (api.localhost -> localhost,
// api.launchql.dev -> launchql.dev), so dev and devnet both provision correctly.
function provisionDomain(apiEndpoint: string): string {
  try {
    const { hostname } = new URL(apiEndpoint);
    // A bare IP host has no domain hierarchy to strip: dropping its first label
    // ('192.168.1.10' -> '168.1.10') would yield a garbage domain. Use it verbatim.
    if (hostname.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return hostname;
    const parts = hostname.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : parts.join('.');
  } catch {
    return 'localhost';
  }
}

// The host's poll deadline when it's a positive number, else the default.
function pollDeadline(ms: number | undefined): number | undefined {
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : undefined;
}

// ---- per-project lock ----------------------------------------------------

const projectLocks = new Map<string, Promise<void>>();

// One provision per project at a time: a second call waits, then sees what
// the first one left (a binding, a recorded ticket) instead of racing it.
async function withProjectLock<T>(cwd: string, fn: () => Promise<T>): Promise<T> {
  const key = await realpath(cwd).catch(() => path.resolve(cwd));
  const previous = projectLocks.get(key) ?? Promise.resolve();
  let release: () => void = noop;
  const done = new Promise<void>((resolve) => (release = resolve));
  const tail = previous.then(() => done);
  projectLocks.set(key, tail);
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (projectLocks.get(key) === tail) projectLocks.delete(key);
  }
}

// ---- the run ---------------------------------------------------------------

type Run = {
  host: ToolsHost;
  cwd: string;
  envPath: string;
  name: string;
  mode: 'ensure' | 'replace';
  apiEndpoint: string;
  modulesEndpoint: string;
  bearer: string;
  ownerId: string;
  viaTool: boolean;
  executor: ProvisionRequestExecutor;
  probe(databaseId: string): Promise<DatabaseProbe>;
};

/**
 * Provision the project's database, or keep the one it is bound to. The host
 * entry point: replace mode refuses a live binding here, and `abandonPending`
 * and `adopt` are honoured.
 */
export function provisionDatabase(
  input: ProvisionInput,
  ctx: { cwd: string; signal?: AbortSignal },
  exec: RunCommand = run,
): Promise<Details> {
  return withProjectLock(ctx.cwd, () => provision(input, ctx.cwd, exec, false));
}

/**
 * The provision_database tool's entry point: its `reprovision: true` may
 * replace a live binding (a clean rebuild), unless the host turned tool
 * reprovisioning off.
 */
export function provisionFromTool(
  input: Pick<ProvisionInput, 'databaseName' | 'mode' | 'replaces'>,
  ctx: { cwd: string; signal?: AbortSignal },
  exec: RunCommand = run,
): Promise<Details> {
  return withProjectLock(ctx.cwd, () => provision(input, ctx.cwd, exec, true));
}

async function provision(input: ProvisionInput, cwd: string, exec: RunCommand, viaTool: boolean): Promise<Details> {
  const name = input.databaseName?.trim();
  if (!name) return failure('failed', 'database_name is required.');

  // Unify endpoints onto the app's backend-config store (environment-aware:
  // *.localhost:3000 in dev, *.launchql.dev packaged). A process.env override
  // still wins for ad-hoc dev; the hardcoded default is a last resort if the
  // store isn't ready.
  const host = getHost();
  const backend = host.backendConfig();
  const apiEndpoint = process.env.API_ENDPOINT || backend?.apiEndpoint || DEFAULT_API_ENDPOINT;
  const modulesEndpoint = process.env.MODULES_ENDPOINT || backend?.modulesEndpoint || DEFAULT_MODULES_ENDPOINT;

  // Every project provisions UNDER the account (requestDatabase owns the
  // database to the JWT user). The account bearer authenticates the mutation
  // and the probes, and is the ACCESS_TOKEN written to .env; it expires with
  // the login session, and any provision run (the skip path too) refreshes it.
  const credential = selectProvisionCredential(host.account(), host.signInHint);
  if (credential.mode === 'error') {
    return failure('signed-out', `Cannot provision a database: ${credential.reason}`);
  }

  const envPath = path.join(cwd, '.env');
  const env = readEnv(await readText(envPath));
  const bound = env.DATABASE_ID || undefined;
  const r: Run = {
    host,
    cwd,
    envPath,
    name,
    mode: input.mode ?? 'ensure',
    apiEndpoint,
    modulesEndpoint,
    bearer: credential.bearer,
    ownerId: credential.ownerId,
    viaTool,
    executor: createProvisionExecutor({ apiEndpoint, modulesEndpoint, bearer: credential.bearer }),
    // The probe carries the account bearer, so it only ever targets the
    // app-configured backend, never a .env-pinned endpoint.
    probe: (databaseId) =>
      probeDatabase({ endpoint: apiEndpoint, bearer: credential.bearer, databaseId, signInHint: host.signInHint }),
  };

  let replaced: string | undefined;
  if (r.mode === 'replace') {
    const refusal = await checkReplace(r, input, bound);
    if (refusal) return refusal;
    replaced = bound;
  } else if (bound) {
    return keepBinding(r, env, bound, input.adopt);
  }

  if (input.adopt) {
    const prewarm = startPrewarm(r, exec);
    return bindDatabase(r, { databaseId: input.adopt, replaced, adopted: true }, prewarm);
  }
  return requestAndBind(r, input, env, replaced, exec);
}

// ---- ensure: keep the binding --------------------------------------------

async function keepBinding(r: Run, env: EnvVars, bound: string, adopt?: string): Promise<Details> {
  const probe = await r.probe(bound);
  if (probe.status === 'unreachable') {
    return failure(
      'backend-unreachable',
      `Cannot verify the existing database binding (DATABASE_ID=${bound}): ${probe.detail}. Retry once the backend answers; don't reprovision on an unreachable backend.`,
      { databaseId: bound },
    );
  }
  if (probe.status === 'missing') {
    return failure(
      'db-missing',
      `Project carries a binding (DATABASE_ID=${bound}) but that database no longer exists on this backend, or this account lost access to it. ${reprovisionAdvice(r.host)}`,
      { databaseId: bound },
    );
  }
  if (probe.ownerId && probe.ownerId !== r.ownerId) {
    return failure(
      'account-mismatch',
      `Project carries a binding (DATABASE_ID=${bound}) but that database was provisioned under a different account than the one signed in. ${reprovisionAdvice(r.host)}`,
      { databaseId: bound },
    );
  }
  if (probe.status === 'suspended') {
    return failure('db-suspended', suspendedText(bound, probe), { databaseId: bound });
  }
  if (adopt && adopt !== bound) {
    return failure(
      'binding-live',
      `The project is bound to a live database (DATABASE_ID=${bound}); adopt binds only an unbound project. Use replace mode to swap it.`,
      { databaseId: bound },
    );
  }

  // Heal .env on the skip path: a stale token (relogin), missing or stale
  // endpoint pins, and the binding keys a partial .env lacks.
  const databaseName = env.DATABASE_NAME || probe.name || '';
  const ownerId = probe.ownerId ?? r.ownerId;
  const refresh: Record<string, string> = {};
  if (env.ACCESS_TOKEN !== r.bearer) refresh.ACCESS_TOKEN = r.bearer;
  if (env.API_ENDPOINT !== r.apiEndpoint) refresh.API_ENDPOINT = r.apiEndpoint;
  if (env.MODULES_ENDPOINT !== r.modulesEndpoint) refresh.MODULES_ENDPOINT = r.modulesEndpoint;
  if (!env.DATABASE_NAME && databaseName) refresh.DATABASE_NAME = databaseName;
  if (!env.PGDATABASE && databaseName) refresh.PGDATABASE = databaseName;
  if (!env.OWNER_ID) refresh.OWNER_ID = ownerId;

  const saved = await saveBinding(r, {
    cwd: r.cwd,
    databaseId: bound,
    databaseName,
    ownerId,
    apiEndpoint: r.apiEndpoint,
    modulesEndpoint: r.modulesEndpoint,
    skipped: true,
  });
  if (saved) return saved;

  let note = '';
  if (Object.keys(refresh).length > 0) {
    const keys = Object.keys(refresh).join(', ');
    try {
      await updateEnvFile(r.envPath, (content) => mergeEnv(content, refresh));
      note = ` Refreshed in .env: ${keys}.`;
    } catch (err) {
      note = ` Could not refresh ${keys} in .env: ${errorText(err)}.`;
    }
  }
  const advice = r.host.toolReprovision === false ? '' : ' Pass reprovision: true only for an explicit clean rebuild.';
  return {
    success: true,
    message: `Project already provisioned (DATABASE_ID=${bound}) and the database is live under this account. Skipping.${advice}${note}`,
    databaseId: bound,
    databaseName,
    ownerId,
    skipped: true,
  };
}

function suspendedText(databaseId: string, probe: Extract<DatabaseProbe, { status: 'suspended' }>): string {
  const why = probe.suspendedReason ? ` (${probe.suspendedReason})` : '';
  return `The bound database (DATABASE_ID=${databaseId}) is suspended${why} since ${probe.suspendedAt}. Its data is kept, so it isn't replaced; nothing can read or change it until the suspension is lifted.`;
}

// ---- replace: compare and swap -------------------------------------------

async function checkReplace(r: Run, input: ProvisionInput, bound: string | undefined): Promise<Details | null> {
  if (r.viaTool && r.host.toolReprovision === false) {
    return failure(
      'reprovision-not-allowed',
      `provision_database can't replace this project's database: the app replaces a database only after the user approves it. ${reprovisionAdvice(r.host)}`,
    );
  }
  const expected = input.replaces === undefined ? bound : input.replaces || undefined;
  if ((expected ?? '') !== (bound ?? '')) {
    return failure(
      'binding-changed',
      `The project's binding changed (DATABASE_ID is ${bound ?? 'unset'}, expected ${expected ?? 'unset'}), so nothing was replaced.`,
      { databaseId: bound },
    );
  }
  if (!bound) return null;

  const probe = await r.probe(bound);
  if (probe.status === 'unreachable') {
    return failure(
      'backend-unreachable',
      `Cannot verify the binding being replaced (DATABASE_ID=${bound}): ${probe.detail}. Retry once the backend answers.`,
      { databaseId: bound },
    );
  }
  if (probe.status === 'suspended') return failure('db-suspended', suspendedText(bound, probe), { databaseId: bound });
  // A missing or foreign-owned binding is replaced; a live one of this account
  // only through the tool's explicit rebuild.
  if (probe.status === 'found' && (!probe.ownerId || probe.ownerId === r.ownerId) && !r.viaTool) {
    return failure(
      'binding-live',
      `The bound database (DATABASE_ID=${bound}) is live under this account, so it wasn't replaced.`,
      { databaseId: bound },
    );
  }
  return null;
}

// ---- request, resume, recover --------------------------------------------

type Lookup = { inFlight: ProvisionTicket[]; refusal?: Details; problem?: string };

// The account's in-flight provisions of this name, newest first. A lookup that
// can't reach the backend refuses (nothing may be requested blind); one that
// gets another error leaves the caller to decide.
async function findInFlight(r: Run, skip: ReadonlySet<string>): Promise<Lookup> {
  try {
    const tickets = await r.executor.listOwn({ databaseName: r.name, ownerId: r.ownerId });
    return { inFlight: tickets.filter((t) => t.id && !skip.has(t.id) && isTicketInFlight(t)) };
  } catch (err) {
    if (isTransientProvisionError(err)) {
      return {
        inFlight: [],
        refusal: failure(
          'backend-unreachable',
          `Could not check the backend for a provision of "${r.name}" already in progress (${errorText(err)}). Nothing was requested; retry once the backend answers.`,
        ),
      };
    }
    return { inFlight: [], problem: errorText(err) };
  }
}

const ticketOf = (r: Run, ticket: ProvisionTicket): PendingTicket => ({
  ticketId: ticket.id,
  databaseName: r.name,
  apiEndpoint: r.apiEndpoint,
  userId: r.ownerId,
  attempts: 0,
});

function startPrewarm(r: Run, exec: RunCommand): Promise<{ ok: boolean; out: string }> {
  // The packages/app scaffold + install are database-INDEPENDENT, so they run
  // alongside the provision. Best-effort: run_codegen re-runs the same
  // idempotent steps. A call that returns early leaves it running; a retry
  // joins that same run rather than starting a second install.
  return prewarmAppWorkspace(r.cwd, exec).catch((err: unknown) => ({ ok: false, out: errorText(err) }));
}

async function requestAndBind(
  r: Run,
  input: ProvisionInput,
  env: EnvVars,
  replaced: string | undefined,
  exec: RunCommand,
): Promise<Details> {
  const abandoned = abandonedTickets(env);
  const abandon = async (ids: string[]) => {
    for (const id of ids) abandoned.add(id);
    await updateEnvFile(r.envPath, (content) => recordAbandoned(clearPendingTicket(content), ids)).catch(noop);
  };

  // A ticket an earlier call stopped waiting on.
  let current: PendingTicket | undefined;
  let recovered = false;
  const recorded = recordedTicket(env);
  if (recorded) {
    if (recorded.apiEndpoint !== r.apiEndpoint || recorded.userId !== r.ownerId) {
      // Requested on another backend or by another account: not ours to follow.
      await updateEnvFile(r.envPath, (content) => archivePendingTicket(content, today())).catch(noop);
    } else if (input.abandonPending) {
      await abandon([recorded.ticketId]);
    } else if (recorded.databaseName !== r.name) {
      return failure(
        'pending-other',
        `A provision of "${recorded.databaseName}" (ticket ${recorded.ticketId}) is still recorded for this project. Call provision_database with database_name "${recorded.databaseName}" to finish it; another name would start a second database.`,
        { ticketId: recorded.ticketId },
      );
    } else {
      current = recorded;
    }
  }

  // No ticket of ours is recorded, but an earlier call may have lost track of
  // one (its record failed to write, or the call was cut off): look it up by
  // name. Only an in-flight one is resumed.
  if (!current) {
    const lookup = await findInFlight(r, abandoned);
    if (lookup.refusal) return lookup.refusal;
    if (lookup.inFlight.length > 0 && input.abandonPending) {
      await abandon(lookup.inFlight.map((t) => t.id));
    } else if (lookup.inFlight.length > 0) {
      current = ticketOf(r, lookup.inFlight[0]);
      recovered = true;
    }
  }

  const prewarm = startPrewarm(r, exec);

  // Resolve the module set: pinned base preset from node-type-registry, then
  // ordered overlays (host default < project-local provision.json). A bad
  // preset/manifest fails the run rather than provisioning a wrong module set.
  let modules;
  try {
    const layers: ProvisionOverlay[] = [];
    const hostOverlay = await r.host.provisionOverlay?.();
    if (hostOverlay) layers.push(hostOverlay);
    const projectOverlay = await loadProvisionManifest(r.cwd);
    if (projectOverlay) layers.push(projectOverlay);
    modules = resolveProvisionModules(layers);
  } catch (err) {
    return failure('failed', `Cannot resolve provision modules: ${errorText(err)}`);
  }

  // requestDatabase claims a warm-pool database when the module set matches a
  // cataloged preset and cold-provisions otherwise; the ticket is polled on the
  // modules endpoint until the database AND its owner bootstrap complete. An
  // explicit subdomain (= name) keeps the per-DB endpoints deterministic.
  const ticketFor = (ticketId: string): PendingTicket => ({
    ticketId,
    databaseName: r.name,
    apiEndpoint: r.apiEndpoint,
    userId: r.ownerId,
    attempts: (current?.ticketId === ticketId ? current.attempts : 0) + 1,
  });
  const lost = new Set<string>();
  let provisioned: { databaseId: string; ticketId: string; resumed?: true };
  for (;;) {
    try {
      provisioned = await requestDatabaseProvision({
        apiEndpoint: r.apiEndpoint,
        modulesEndpoint: r.modulesEndpoint,
        bearer: r.bearer,
        databaseName: r.name,
        domain: provisionDomain(r.apiEndpoint),
        request: selectProvisionRequest(modules),
        executor: r.executor,
        // Past the attempt cap one read says whether it finished; no more waiting.
        pollDeadlineMs:
          current && current.attempts >= MAX_PENDING_ATTEMPTS ? 0 : pollDeadline(r.host.provisionPollDeadlineMs),
        resumeTicketId: current?.ticketId,
      });
      break;
    } catch (err) {
      if (err instanceof ProvisionPendingError) {
        return pendingResult(r, ticketFor(err.ticketId), err.message, recovered);
      }
      if (err instanceof ProvisionTicketLostError) {
        // The ticket can't be read back, which doesn't mean the provision
        // stopped. Follow another in-flight one of this name, or stop without
        // requesting anything.
        lost.add(err.ticketId);
        const lookup = await findInFlight(r, new Set([...abandoned, ...lost]));
        if (lookup.refusal) return lookup.refusal;
        if (lookup.inFlight.length > 0) {
          current = ticketOf(r, lookup.inFlight[0]);
          recovered = true;
          continue;
        }
        await updateEnvFile(r.envPath, clearPendingTicket).catch(noop);
        const checked = lookup.problem
          ? `the backend couldn't be asked for another one (${lookup.problem})`
          : 'no other provision of that name is in progress';
        return failure(
          'ticket-lost',
          `The provision of "${r.name}" (ticket ${err.ticketId}) can no longer be found on this backend, and ${checked}. Nothing was created, and the record is cleared, so calling provision_database again requests a new database.`,
          { ticketId: err.ticketId },
        );
      }
      // A definitive failure ends the recorded request, so forget it.
      if (current) await updateEnvFile(r.envPath, clearPendingTicket).catch(noop);
      return requestFailure(r, err);
    }
  }

  return bindDatabase(
    r,
    {
      databaseId: provisioned.databaseId,
      ticket: ticketFor(provisioned.ticketId),
      resumed: provisioned.resumed === true,
      recovered,
      replaced,
    },
    prewarm,
  );
}

// The provision is still running: record its ticket so the next call with the
// same name resumes it. Past MAX_PENDING_ATTEMPTS the ticket stays recorded
// and the call fails `provision-stuck`: nothing new is requested while it is
// in flight, until the host abandons it.
async function pendingResult(r: Run, ticket: PendingTicket, reason: string, recovered: boolean): Promise<Details> {
  const { ticketId } = ticket;
  let recordedOk = true;
  try {
    await updateEnvFile(r.envPath, (content) => recordPendingTicket(content, ticket));
  } catch {
    recordedOk = false;
  }
  if (ticket.attempts > MAX_PENDING_ATTEMPTS) {
    return failure(
      'provision-stuck',
      `Database "${r.name}" is still not ready after ${MAX_PENDING_ATTEMPTS} waits (${reason}). Its request (ticket ${ticketId}) stays recorded, and no other database is requested while it is in progress. Check the backend's provisioning jobs.`,
      { ticketId },
    );
  }
  const again = `call provision_database again with database_name "${r.name}"${
    r.mode === 'replace' && r.viaTool ? ' and reprovision: true' : ''
  }`;
  const message = recordedOk
    ? `Database "${r.name}" is still provisioning (${reason}). The request is recorded in .env; ${again} to keep waiting on it. Don't change the name: that starts a second database.`
    : `Database "${r.name}" is still provisioning (${reason}). Recording its ticket in .env failed, but the backend still has it: ${again} to keep waiting on it. Don't change the name: that starts a second database.`;
  return { success: false, message, pending: true, ticketId, ...(recovered ? { recovered: true } : {}) };
}

const NAME_TAKEN_RE = /already exists|already taken|already in use|duplicate/i;

async function requestFailure(r: Run, err: unknown): Promise<Details> {
  const detail = errorText(err);
  if (!NAME_TAKEN_RE.test(detail)) return failure('failed', `Database provisioning failed: ${detail}.`);
  const heldBy = await ownHolder(r);
  if (heldBy) {
    const when = heldBy.createdAt ? `, requested ${heldBy.createdAt}` : '';
    return failure(
      'name-taken',
      `Database provisioning failed: ${detail}. The name "${r.name}" belongs to a database this account provisioned earlier (ID ${heldBy.databaseId}${when}) that this project isn't bound to, so it was not bound. Re-run with a different database_name.`,
      { heldBy },
    );
  }
  return failure(
    'name-taken',
    `Database provisioning failed: ${detail}. The database name is already taken on the backend; re-run with a different database_name.`,
  );
}

// A completed provision of this name by this account whose database still
// exists under it: reported with name-taken so the host can adopt it.
async function ownHolder(r: Run): Promise<Details['heldBy'] | undefined> {
  let tickets: ProvisionTicket[];
  try {
    tickets = await r.executor.listOwn({ databaseName: r.name, ownerId: r.ownerId });
  } catch {
    return undefined;
  }
  const done = tickets.find((t) => t.status === 'completed' && t.databaseId && !isTicketInFlight(t));
  if (!done) return undefined;
  const probe = await r.probe(done.databaseId);
  if (probe.status !== 'found' && probe.status !== 'suspended') return undefined;
  if (probe.ownerId && probe.ownerId !== r.ownerId) return undefined;
  return { databaseId: done.databaseId, yours: true, ...(done.createdAt ? { createdAt: done.createdAt } : {}) };
}

// ---- binding ---------------------------------------------------------------

async function saveBinding(r: Run, binding: ProjectBinding, ticket?: PendingTicket): Promise<Details | null> {
  if (!r.host.persistBinding) return null;
  try {
    await r.host.persistBinding(binding);
    return null;
  } catch (err) {
    // Keep the ticket recorded, so the next call resumes it and binds it.
    if (ticket) await updateEnvFile(r.envPath, (content) => recordPendingTicket(content, ticket)).catch(noop);
    return failure(
      'binding-not-saved',
      `Database "${binding.databaseName}" (ID ${binding.databaseId}) is ready, but the app couldn't save the binding (${errorText(err)}), so .env was left unchanged.${
        ticket ? ' Calling provision_database again with the same name binds it.' : ''
      }`,
      { databaseId: binding.databaseId, ...(ticket ? { ticketId: ticket.ticketId } : {}) },
    );
  }
}

type Bind = {
  databaseId: string;
  ticket?: PendingTicket;
  resumed?: boolean;
  recovered?: boolean;
  replaced?: string;
  adopted?: boolean;
};

async function bindDatabase(
  r: Run,
  bind: Bind,
  prewarm: Promise<{ ok: boolean; out: string }>,
): Promise<Details> {
  const { databaseId, ticket } = bind;

  // Bind only a database this account owns. An unreachable backend keeps the
  // ticket for the next call to check again.
  const owner = await r.probe(databaseId);
  if (owner.status === 'unreachable') {
    if (ticket) {
      return pendingResult(r, ticket, `provisioned, but its owner couldn't be confirmed: ${owner.detail}`, bind.recovered);
    }
    return failure('backend-unreachable', `Cannot verify database ${databaseId}: ${owner.detail}. Retry once the backend answers.`);
  }
  const visible = owner.status !== 'missing';
  if (!visible || owner.ownerId !== r.ownerId) {
    if (ticket) await updateEnvFile(r.envPath, clearPendingTicket).catch(noop);
    const why = visible ? "it isn't owned by" : "it isn't visible to";
    if (bind.adopted) {
      return failure(visible ? 'account-mismatch' : 'db-missing', `Database ${databaseId} was not bound: ${why} the signed-in account.`);
    }
    return failure(
      'failed',
      `Database provisioning returned database ${databaseId}, but ${why} the signed-in account, so it was not bound. Call provision_database again to request a new database.`,
    );
  }
  if (bind.adopted && owner.status === 'suspended') {
    return failure('db-suspended', suspendedText(databaseId, owner));
  }

  const saved = await saveBinding(
    r,
    {
      cwd: r.cwd,
      databaseId,
      databaseName: r.name,
      ownerId: r.ownerId,
      apiEndpoint: r.apiEndpoint,
      modulesEndpoint: r.modulesEndpoint,
      ...(bind.replaced ? { replaces: bind.replaced } : {}),
    },
    ticket,
  );
  if (saved) return saved;

  // Write the binding into .env (upsert, preserving other keys), dropping any
  // recorded pending request: the project is bound now.
  try {
    await updateEnvFile(r.envPath, (content) =>
      mergeEnv(
        clearPendingTicket(
          bind.replaced ? archiveBindingKeys(content, ARCHIVED_BINDING_KEYS, today()) : content,
        ),
        provisionEnvVars({
          databaseId,
          databaseName: r.name,
          ownerId: r.ownerId,
          accessToken: r.bearer,
          apiEndpoint: r.apiEndpoint,
          modulesEndpoint: r.modulesEndpoint,
        }),
      ),
    );
  } catch (err) {
    return failure(
      'env-write-failed',
      `Database provisioned (ID: ${databaseId}) but writing .env failed: ${errorText(err)}`,
      { databaseId },
    );
  }

  // Settle the concurrent prewarm so the scaffold + install are in place before
  // run_codegen runs. A failure here is non-fatal: run_codegen redoes the work.
  const prewarmed = (await prewarm).ok ? ' packages/app prewarmed.' : '';
  const notes = [
    bind.resumed ? ' Finished the provision an earlier call had started.' : '',
    bind.recovered ? ' Found it on the backend by name: its ticket was no longer recorded.' : '',
    prewarmed,
    bind.replaced
      ? ' Previous binding archived in .env (old database kept); rebuild the schema with provision_blueprint + run_codegen.'
      : '',
  ].join('');
  const message = bind.adopted
    ? `Bound database "${r.name}" (ID: ${databaseId}), which this account provisioned earlier. Credentials written to .env.${notes}`
    : `Provisioned database "${r.name}" (ID: ${databaseId}). Credentials written to .env.${notes}`;
  return {
    success: true,
    message,
    databaseId,
    databaseName: r.name,
    ownerId: r.ownerId,
    ...(bind.resumed ? { resumed: true } : {}),
    ...(bind.recovered ? { recovered: true } : {}),
    ...(bind.replaced ? { replaced: bind.replaced } : {}),
  };
}
