import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { prewarmAppWorkspace, run, type RunCommand } from '../app-workspace';
import { probeDatabase } from '../db-probe';
import { getHost } from '../host';
import { selectProvisionCredential } from '../provision-database/credential';
import {
  archiveBindingKeys,
  ARCHIVED_BINDING_KEYS,
  mergeEnv,
  provisionEnvVars,
  readEnv,
} from '../provision-database/env-file';
import { loadProvisionManifest } from '../provision-database/manifest';
import {
  clearPendingTicket,
  matchingPendingTicket,
  MAX_PENDING_ATTEMPTS,
  type PendingTicket,
  recordPendingTicket,
} from '../provision-database/pending-ticket';
import { selectProvisionRequest } from '../provision-database/preset-match';
import {
  ProvisionPendingError,
  requestDatabaseProvision,
} from '../provision-database/request-database';
import { type ProvisionOverlay, resolveProvisionModules } from '../provision-database/resolve';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';
const DEFAULT_MODULES_ENDPOINT = 'http://modules.localhost:3000/graphql';

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

const ProvisionDatabaseZod = z.object({
  database_name: z
    .string()
    .describe(
      'Name for the app database (lowercase, alphanumeric + underscores). Doubles as the deterministic provisioning subdomain (api-<name>/auth-<name>/app-<name>.localhost), so keep it short and URL-safe.',
    ),
  reprovision: z
    .boolean()
    .describe(
      'Mint a fresh database even though the project already carries a binding — use when the bound database no longer exists on this backend (refreshed backend, deleted database), when it belongs to a different account than the one signed in, or when the user asks for a clean rebuild. The old .env keys are archived as comments and the old database is never deleted server-side. The schema must be rebuilt afterwards (provision_blueprint + run_codegen); records do not carry over.',
    )
    .optional(),
});

type Params = z.infer<typeof ProvisionDatabaseZod>;

export type ProvisionDatabaseDetails = {
  success: boolean;
  message: string;
  databaseId?: string;
  databaseName?: string;
  ownerId?: string;
  /** True when an existing live binding was kept — nothing changed. */
  skipped?: boolean;
  /**
   * True when the call stopped waiting while the provision is still running.
   * The ticket is recorded in .env, and calling again with the same
   * database_name resumes it.
   */
  pending?: boolean;
  /** The provision ticket, on a pending result. */
  ticketId?: string;
  /** True when this call finished a provision an earlier call had started. */
  resumed?: boolean;
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: ProvisionDatabaseDetails };

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], details: { success: false, message } };
}

// Edit .env from its current content, read right before the write, so changes
// made while this call waited on the backend (by another tool or the user)
// aren't overwritten with what the file held when the call started.
async function updateEnvFile(envPath: string, edit: (content: string) => string): Promise<void> {
  let content = '';
  try {
    content = await readFile(envPath, 'utf8');
  } catch {
    /* no .env yet */
  }
  await writeFile(envPath, edit(content));
}

// The provision is still running: record its ticket so the next call with the
// same name resumes it, and tell the agent to call again rather than rename.
// Past MAX_PENDING_ATTEMPTS the ticket is dropped and the call fails instead.
async function pendingResult(
  envPath: string,
  ticket: PendingTicket,
  reason: string,
  reprovision: boolean,
): Promise<ToolResult> {
  const { databaseName, ticketId } = ticket;
  if (ticket.attempts > MAX_PENDING_ATTEMPTS) {
    await updateEnvFile(envPath, clearPendingTicket).catch((): void => undefined);
    return fail(
      `Database "${databaseName}" is still not ready after ${MAX_PENDING_ATTEMPTS} waits (${reason}), so provision_database stopped following its request (ticket ${ticketId}). Check the backend's provisioning jobs before calling provision_database again: a new call starts a new provision.`,
    );
  }
  let recorded = true;
  try {
    await updateEnvFile(envPath, (content) => recordPendingTicket(content, ticket));
  } catch {
    recorded = false;
  }
  const again = `call provision_database again with database_name "${databaseName}"${
    reprovision ? ' and reprovision: true' : ''
  }`;
  const message = recorded
    ? `Database "${databaseName}" is still provisioning (${reason}). The request is recorded in .env; ${again} to keep waiting on it. Don't change the name: that starts a second database.`
    : `Database "${databaseName}" is still provisioning (${reason}), but recording its ticket in .env failed, so a later call can't resume it. Calling again with this name starts a second provision.`;
  return {
    content: [{ type: 'text', text: message }],
    details: { success: false, message, pending: true, ticketId },
  };
}

// The host's poll deadline when it's a positive number, else the default.
function pollDeadline(ms: number | undefined): number | undefined {
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : undefined;
}

// `exec` runs the prewarm's child processes (clone, install); tests inject it.
export function createProvisionDatabaseTool(
  exec: RunCommand = run,
): HarnessTool<typeof ProvisionDatabaseZod, ProvisionDatabaseDetails> {
  return {
    name: 'provision_database',
    label: 'Provision database',
    description:
      'Bootstrap a new Constructive database for the project under your account: provision the standard module set and write credentials (DATABASE_ID, ACCESS_TOKEN, etc.) to the project .env. Run this ONCE before any schema/record tools. If the project is already bound to a live database under the signed-in account it skips; if the bound database no longer exists on this backend (refreshed/deleted) or belongs to a different account, pass reprovision: true to mint a fresh one (old keys archived in .env, old database kept; rebuild the schema afterwards). If a call returns while the database is still provisioning, call it again with the same database_name to keep waiting; a different name starts a second database.',
    promptSnippet:
      'provision_database: one-time bootstrap of the project database (owner + modules + .env). Run before describe_schema/provision_blueprint. Skips when the existing binding is live under the signed-in account; reprovision: true replaces a dead or foreign-account binding (archives old keys, never deletes the old db). Gated.',
    parameters: ProvisionDatabaseZod,
    async execute(params: Params, ctx): Promise<ToolResult> {
      const databaseName = params.database_name.trim();
      if (!databaseName) return fail('database_name is required.');

      const envPath = path.join(ctx.cwd, '.env');
      let existing = '';
      try {
        existing = await readFile(envPath, 'utf8');
      } catch {
        /* no existing .env — fine */
      }

      // Unify endpoints onto the app's backend-config store (environment-aware:
      // *.localhost:3000 in dev, *.launchql.dev packaged). A process.env override
      // still wins for ad-hoc dev; the hardcoded default is a last resort if the
      // store isn't ready.
      const host = getHost();
      const backend = host.backendConfig();
      const apiEndpoint = process.env.API_ENDPOINT || backend?.apiEndpoint || DEFAULT_API_ENDPOINT;
      const modulesEndpoint =
        process.env.MODULES_ENDPOINT || backend?.modulesEndpoint || DEFAULT_MODULES_ENDPOINT;

      // Every new project provisions UNDER the account (requestDatabase owns the
      // database to the JWT user), so it is account-owned and enumerable. The
      // account bearer is the single credential: it authenticates the provision
      // mutation, the idempotency
      // probe below, and is the ACCESS_TOKEN written to .env for project-local
      // scripts. It expires with the login session — a relogin plus any provision
      // run (including the skip path) refreshes the .env copy. A signed-in session
      // with no usable bearer errors out here rather than silently minting a
      // throwaway owner. Gate BEFORE prewarm so an error return doesn't leak a
      // detached background scaffold/install.
      const credential = selectProvisionCredential(host.account(), host.signInHint);
      if (credential.mode === 'error') {
        return fail(`Cannot provision a database: ${credential.reason}`);
      }
      const ownerId = credential.ownerId;

      // Idempotency keyed on binding liveness AND ownership: a binding is done only
      // when its database still answers and belongs to the signed-in account
      // (schemas are account-scoped). A dead binding (backend refreshed, database
      // deleted, key revoked) or a live one under another account points at the
      // reprovision path; an unreachable backend is a retry, never a reprovision.
      const existingEnv = readEnv(existing);
      // A request an earlier call stopped waiting on. Only the same name, backend
      // and account resume it; asking for that name again would start a second
      // provision instead.
      const pending = matchingPendingTicket(existingEnv, {
        databaseName,
        apiEndpoint,
        userId: ownerId,
      });
      const hasBinding = Boolean(existingEnv.DATABASE_ID && existingEnv.ACCESS_TOKEN);
      if (hasBinding && !params.reprovision) {
        // The probe carries the account bearer, so it only ever targets the
        // app-configured backend — never a .env-pinned endpoint, which an
        // untrusted cloned project controls.
        const probe = await probeDatabase({
          endpoint: apiEndpoint,
          bearer: credential.bearer,
          databaseId: existingEnv.DATABASE_ID,
          signInHint: host.signInHint,
        });
        if (probe.status === 'unreachable') {
          return fail(
            `Cannot verify the existing database binding: backend unreachable (${probe.detail}). Check the Constructive backend is running, then retry — do not reprovision on an unreachable backend.`,
          );
        }
        if (probe.status === 'missing') {
          return fail(
            `Project carries a binding (DATABASE_ID=${existingEnv.DATABASE_ID}) but that database no longer exists on this backend. Re-run with reprovision: true to mint a fresh database (old keys archived in .env, old database untouched), then rebuild the schema (provision_blueprint + run_codegen); records do not carry over.`,
          );
        }
        const sessionUserId = host.account()?.userId;
        if (probe.ownerId && sessionUserId && probe.ownerId !== sessionUserId) {
          return fail(
            `Project carries a binding (DATABASE_ID=${existingEnv.DATABASE_ID}) but that database was provisioned under a different account than the one signed in. Re-run with reprovision: true to mint a fresh database under this account (old keys archived in .env, old database untouched), then rebuild the schema (provision_blueprint + run_codegen); records do not carry over.`,
          );
        }
        // Heal .env on the skip path: a stale token (relogin) or missing/stale
        // endpoint pins (project provisioned before pins existed, or backend
        // config changed) refresh to the current session + backend.
        const refresh: Record<string, string> = {};
        if (existingEnv.ACCESS_TOKEN !== credential.bearer) refresh.ACCESS_TOKEN = credential.bearer;
        if (existingEnv.API_ENDPOINT !== apiEndpoint) refresh.API_ENDPOINT = apiEndpoint;
        if (existingEnv.MODULES_ENDPOINT !== modulesEndpoint) {
          refresh.MODULES_ENDPOINT = modulesEndpoint;
        }
        let tokenNote = '';
        if (Object.keys(refresh).length > 0) {
          const keys = Object.keys(refresh).join(', ');
          try {
            await updateEnvFile(envPath, (content) => mergeEnv(content, refresh));
            tokenNote = ` Refreshed in .env from the signed-in session: ${keys}.`;
          } catch (err) {
            tokenNote = ` Could not refresh ${keys} in .env: ${err instanceof Error ? err.message : String(err)}.`;
          }
        }
        const message = `Project already provisioned (DATABASE_ID=${existingEnv.DATABASE_ID}) and the database is live under this account. Skipping — pass reprovision: true only for an explicit clean rebuild.${tokenNote}`;
        return {
          content: [{ type: 'text', text: message }],
          details: {
            success: true,
            message,
            databaseId: existingEnv.DATABASE_ID,
            databaseName: existingEnv.DATABASE_NAME,
            ownerId: existingEnv.OWNER_ID,
            skipped: true,
          },
        };
      }
      const archiveOldBinding = hasBinding && params.reprovision === true;

      // The packages/app scaffold + pnpm install are database-INDEPENDENT, so kick
      // them off now to run concurrently with the provisioning request below
      // (near-instant on a warm-pool hit, up to minutes on the cold path).
      // This keeps clone + install off run_codegen's critical path. Best-effort:
      // run_codegen re-runs the same idempotent steps, so a prewarm failure is
      // harmless. Never let it reject (we await it before returning). A call
      // that returns pending leaves it running; a retry joins that same run
      // rather than starting a second install.
      const prewarm = prewarmAppWorkspace(ctx.cwd, exec).catch(
        (err: unknown): { ok: boolean; out: string } => ({
          ok: false,
          out: err instanceof Error ? err.message : String(err),
        }),
      );

      // Resolve the module set: pinned base preset from node-type-registry, then
      // ordered overlays (host default < project-local provision.json). No list is
      // hand-copied here; overlays are pure data. A bad preset/manifest fails the
      // run rather than provisioning a wrong module set.
      let modules;
      try {
        const layers: ProvisionOverlay[] = [];
        const hostOverlay = await host.provisionOverlay?.();
        if (hostOverlay) layers.push(hostOverlay);
        const projectOverlay = await loadProvisionManifest(ctx.cwd);
        if (projectOverlay) layers.push(projectOverlay);
        modules = resolveProvisionModules(layers);
      } catch (err) {
        return fail(
          `Cannot resolve provision modules: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Provision on the API endpoint: requestDatabase claims a warm-pool
      // database when the resolved module set matches a cataloged preset
      // (near-instant) and cold-provisions asynchronously otherwise; the ticket
      // is polled on the modules endpoint until the database AND its deferred
      // owner bootstrap complete. No retry wrapper: a pending ticket is the
      // normal first response, and transient poll failures are absorbed inside
      // the poll loop. The domain still derives from the api endpoint's host
      // (per-DB endpoints live under it), and an explicit subdomain
      // (= databaseName) keeps them deterministic (SUBDOMAIN-001).
      const ticketFor = (ticketId: string): PendingTicket => ({
        ticketId,
        databaseName,
        apiEndpoint,
        userId: ownerId,
        attempts: (pending?.ticketId === ticketId ? pending.attempts : 0) + 1,
      });
      const reprovision = params.reprovision === true;
      let provisioned: { databaseId: string; ticketId: string; resumed?: true };
      try {
        provisioned = await requestDatabaseProvision({
          apiEndpoint,
          modulesEndpoint,
          bearer: credential.bearer,
          databaseName,
          domain: provisionDomain(apiEndpoint),
          request: selectProvisionRequest(modules),
          pollDeadlineMs: pollDeadline(host.provisionPollDeadlineMs),
          resumeTicketId: pending?.ticketId,
        });
      } catch (err) {
        if (err instanceof ProvisionPendingError) {
          return pendingResult(envPath, ticketFor(err.ticketId), err.message, reprovision);
        }
        // A definitive failure ends the recorded request, so forget it.
        if (pending) await updateEnvFile(envPath, clearPendingTicket).catch((): void => undefined);
        const detail = err instanceof Error ? err.message : String(err);
        const nameTakenHint = /already exists|already taken|already in use|duplicate/i.test(detail)
          ? ' The database name is already taken on the backend — re-run with a different database_name.'
          : '';
        return fail(`Database provisioning failed: ${detail}.${nameTakenHint}`);
      }
      const { databaseId, ticketId } = provisioned;

      // Bind only a database this account owns. A resumed ticket is the main
      // reason to look: it was recorded by an earlier call. An unreachable
      // backend keeps the ticket for the next call to check again.
      const owner = await probeDatabase({
        endpoint: apiEndpoint,
        bearer: credential.bearer,
        databaseId,
        signInHint: host.signInHint,
      });
      if (owner.status === 'unreachable') {
        return pendingResult(
          envPath,
          ticketFor(ticketId),
          `provisioned, but its owner couldn't be confirmed: ${owner.detail}`,
          reprovision,
        );
      }
      if (owner.status === 'missing' || owner.ownerId !== ownerId) {
        await updateEnvFile(envPath, clearPendingTicket).catch((): void => undefined);
        return fail(
          `Database provisioning returned database ${databaseId}, but ${
            owner.status === 'missing' ? "it isn't visible to" : "it isn't owned by"
          } the signed-in account, so it was not bound. Call provision_database again to request a new database.`,
        );
      }

      // Persist the binding to the project .env (upsert, preserving other keys),
      // dropping any recorded pending request: the project is bound now.
      try {
        await updateEnvFile(envPath, (content) =>
          mergeEnv(
            clearPendingTicket(
              archiveOldBinding
                ? archiveBindingKeys(content, ARCHIVED_BINDING_KEYS, new Date().toISOString().slice(0, 10))
                : content,
            ),
            provisionEnvVars({
              databaseId,
              databaseName,
              ownerId,
              accessToken: credential.bearer,
              apiEndpoint,
              modulesEndpoint,
            }),
          ),
        );
      } catch (err) {
        return fail(
          `Database provisioned (ID: ${databaseId}) but writing .env failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Settle the concurrent prewarm so the scaffold + install are in place before
      // run_codegen runs. A failure here is non-fatal — run_codegen redoes the work.
      const prewarmResult = await prewarm;
      const prewarmNote = prewarmResult.ok ? ' packages/app prewarmed.' : '';

      const reprovisionNote = archiveOldBinding
        ? ' Previous binding archived in .env (old database kept); rebuild the schema with provision_blueprint + run_codegen.'
        : '';
      const resumedNote = provisioned.resumed
        ? ' Finished the provision an earlier call had started.'
        : '';
      const message = `Provisioned database "${databaseName}" (ID: ${databaseId}). Credentials written to .env.${resumedNote}${prewarmNote}${reprovisionNote}`;
      return {
        content: [{ type: 'text', text: message }],
        details: {
          success: true,
          message,
          databaseId,
          databaseName,
          ownerId,
          ...(provisioned.resumed ? { resumed: true } : {}),
        },
      };
    },
  };
}

export const provisionDatabaseTool = createProvisionDatabaseTool();
