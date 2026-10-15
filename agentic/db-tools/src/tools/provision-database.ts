import { writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { prewarmAppWorkspace } from '../app-workspace';
import { PROVISION_TIMEOUT_MS, toolFetch, withTimeLimit } from '../backend-fetch';
import { probeDatabase } from '../db-probe';
import { getHost } from '../host';
import { selectProvisionCredential } from '../provision-database/credential';
import {
  archiveBindingKeys,
  ARCHIVED_BINDING_KEYS,
  mergeEnv,
  provisionEnvVars,
} from '../provision-database/env-file';
import { loadProvisionManifest } from '../provision-database/manifest';
import { selectProvisionRequest } from '../provision-database/preset-match';
import { requestDatabaseProvision } from '../provision-database/request-database';
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
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: ProvisionDatabaseDetails };

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], details: { success: false, message } };
}

// Minimal .env reader for the idempotency check (full parsing lives in context.ts).
function parseEnvKeys(source: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return env;
}

export const provisionDatabaseTool: HarnessTool<
  typeof ProvisionDatabaseZod,
  ProvisionDatabaseDetails
> = {
  name: 'provision_database',
  label: 'Provision database',
  description:
    'Bootstrap a new Constructive database for the project under your account: provision the standard module set and write credentials (DATABASE_ID, ACCESS_TOKEN, etc.) to the project .env. Run this ONCE before any schema/record tools. If the project is already bound to a live database under the signed-in account it skips; if the bound database no longer exists on this backend (refreshed/deleted) or belongs to a different account, pass reprovision: true to mint a fresh one (old keys archived in .env, old database kept; rebuild the schema afterwards).',
  promptSnippet:
    'provision_database: one-time bootstrap of the project database (owner + modules + .env). Run before describe_schema/provision_blueprint. Skips when the existing binding is live under the signed-in account; reprovision: true replaces a dead or foreign-account binding (archives old keys, never deletes the old db). Gated.',
  parameters: ProvisionDatabaseZod,
  async execute(params: Params, ctx): Promise<ToolResult> {
    const databaseName = params.database_name.trim();
    if (!databaseName) return fail('database_name is required.');

    const signal = withTimeLimit(
      ctx.signal,
      PROVISION_TIMEOUT_MS,
      `provision_database stopped after ${PROVISION_TIMEOUT_MS / 60_000} min. The database can still finish on the server; run provision_database again to check.`,
    );
    const call = { ...ctx, signal };

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
    const existingEnv = parseEnvKeys(existing);
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
        fetch: toolFetch(call),
        signal,
      });
      if (probe.outcome === 'unreachable') {
        return fail(
          `Cannot verify the existing database binding: backend unreachable (${probe.detail}). Check the Constructive backend is running, then retry — do not reprovision on an unreachable backend.`,
        );
      }
      if (probe.outcome === 'missing') {
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
          await writeFile(envPath, mergeEnv(existing, refresh));
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
    if (hasBinding && params.reprovision) {
      existing = archiveBindingKeys(
        existing,
        ARCHIVED_BINDING_KEYS,
        new Date().toISOString().slice(0, 10),
      );
    }

    // The packages/app scaffold + pnpm install are database-INDEPENDENT, so kick
    // them off now to run concurrently with the provisioning request below
    // (near-instant on a warm-pool hit, up to minutes on the cold path).
    // This keeps clone + install off run_codegen's critical path. Best-effort:
    // run_codegen re-runs the same idempotent steps, so a prewarm failure is
    // harmless. Never let it reject (we await it before returning).
    const prewarm = prewarmAppWorkspace(ctx.cwd, signal).catch(
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
    let databaseId: string;
    try {
      ({ databaseId } = await requestDatabaseProvision({
        apiEndpoint,
        modulesEndpoint,
        bearer: credential.bearer,
        databaseName,
        domain: provisionDomain(apiEndpoint),
        request: selectProvisionRequest(modules),
        fetch: toolFetch(call, { timeoutMs: 0 }),
        pollFetch: toolFetch(call),
        signal,
      }));
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const nameTakenHint = /already exists|already taken|already in use|duplicate/i.test(detail)
        ? ' The database name is already taken on the backend — re-run with a different database_name.'
        : '';
      return fail(`Database provisioning failed: ${detail}.${nameTakenHint}`);
    }

    // Persist the binding to the project .env (upsert, preserving other keys).
    const merged = mergeEnv(
      existing,
      provisionEnvVars({
        databaseId,
        databaseName,
        ownerId,
        accessToken: credential.bearer,
        apiEndpoint,
        modulesEndpoint,
      }),
    );
    try {
      await writeFile(envPath, merged);
    } catch (err) {
      return fail(
        `Database provisioned (ID: ${databaseId}) but writing .env failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // Settle the concurrent prewarm so the scaffold + install are in place before
    // run_codegen runs. A failure here is non-fatal — run_codegen redoes the work.
    const prewarmResult = await prewarm;
    const prewarmNote = prewarmResult.ok ? ' packages/app prewarmed.' : '';

    const reprovisionNote =
      hasBinding && params.reprovision
        ? ' Previous binding archived in .env (old database kept); rebuild the schema with provision_blueprint + run_codegen.'
        : '';
    const message = `Provisioned database "${databaseName}" (ID: ${databaseId}). Credentials written to .env.${prewarmNote}${reprovisionNote}`;
    return {
      content: [{ type: 'text', text: message }],
      details: {
        success: true,
        message,
        databaseId,
        databaseName,
        ownerId,
      },
    };
  },
};
