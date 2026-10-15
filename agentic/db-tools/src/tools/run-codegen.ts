import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import {
  ensureAppScaffold,
  ensureWorkspaceConfig,
  IGNORED_BUILDS_RE,
  pinCodegenLatest,
  prewarmAppWorkspace,
  run,
} from '../app-workspace';
import { sleep } from '../backend-fetch';
import { getHost } from '../host';
import { normalizeSdkBarrels } from '../run-codegen/barrels';
import { codegenEndpointEnv, derivePlaneEndpoints, envLocalContent } from '../run-codegen/endpoints';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';

const RunCodegenZod = z.object({});
type Params = z.infer<typeof RunCodegenZod>;

export type RunCodegenDetails = {
  success: boolean;
  message: string;
  barrelsRewritten?: number;
  generatedSubmodules?: string[];
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: RunCodegenDetails };

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], details: { success: false, message } };
}

const FETCH_RESET_RE = /Failed to fetch schema|Connection reset|ECONNRESET|socket hang up/i;

// Read the binding provision_database wrote to the project .env. The
// API_ENDPOINT pin identifies which backend owns the binding — it wins over
// the app's current backend config, matching context.ts data-plane precedence.
async function readProjectEnv(
  cwd: string,
): Promise<{ databaseName?: string; apiEndpoint?: string }> {
  try {
    const env = await readFile(path.join(cwd, '.env'), 'utf8');
    const read = (key: string) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
    return { databaseName: read('DATABASE_NAME'), apiEndpoint: read('API_ENDPOINT') };
  } catch {
    return {};
  }
}

// The codegen CLI introspects three live vhosts (admin/auth/app). Under load the
// Constructive backend intermittently resets a connection mid-introspection
// ("Failed to fetch schema: Connection reset"), which is transient — a retry
// almost always clears it. Re-run the whole generate (it rebuilds all targets)
// up to `attempts` times, only on a fetch/reset failure; any other failure is
// real and returned immediately (CODEGEN-RETRY-001).
async function runCodegenWithRetry(
  appDir: string,
  env: Record<string, string>,
  signal?: AbortSignal,
  attempts = 4,
): Promise<{ ok: boolean; out: string }> {
  const sdk = path.join(appDir, 'src', 'graphql', 'sdk');
  let last: { ok: boolean; out: string } = { ok: false, out: 'codegen never ran' };
  for (let i = 1; i <= attempts; i++) {
    for (const sub of ['admin', 'auth', 'app']) {
      await rm(path.join(sdk, sub), { recursive: true, force: true });
    }
    last = await run(
      'npx',
      ['@constructive-io/graphql-codegen', 'generate', '--config', './graphql-codegen.config.ts'],
      appDir,
      env,
      signal,
    );
    if (last.ok) return last;
    if (!FETCH_RESET_RE.test(last.out)) return last;
    if (i < attempts) await sleep(2000 * i, signal);
  }
  return last;
}

export const runCodegenTool: HarnessTool<typeof RunCodegenZod, RunCodegenDetails> = {
  name: 'run_codegen',
  label: 'Run codegen',
  description:
    "Generate the typed GraphQL SDK for the project's Next.js app (packages/app). Runs the exact deterministic sequence — scaffold packages/app from the constructive-app template if it doesn't exist yet, hoist the graphql override to the root workspace so a single grafast resolves, pin codegen to latest, do one clean install, run codegen (retrying transient backend connection resets), and normalize SDK barrels for Turbopack. Run AFTER provisioning the database and creating schema; it scaffolds packages/app itself, so no separate `pgpm init` step is needed. The scaffold + install are usually prewarmed during provision_database, so this is fast.",
  promptSnippet:
    'run_codegen: scaffold packages/app (if missing) + regenerate the typed SDK (workspace-config + clean install + codegen-with-retry + barrel-normalize). Run after schema changes. Gated.',
  parameters: RunCodegenZod,
  async execute(_params: Params, ctx): Promise<ToolResult> {
    const cwd = ctx.cwd;
    const appDir = path.join(cwd, 'packages', 'app');

    // Materialize packages/app deterministically if it isn't there yet — this
    // replaces the flaky `pgpm init` scaffold step (PGPM-001). When
    // provision_database prewarmed it, this no-ops.
    const scaffold = await ensureAppScaffold(cwd, ctx.signal);
    if (!scaffold.ok) {
      return fail(scaffold.out);
    }

    const { databaseName: dbName, apiEndpoint: envApiEndpoint } = await readProjectEnv(cwd);
    if (!dbName) {
      return fail('DATABASE_NAME missing from .env — provision the database first, then re-run.');
    }

    const backend = getHost().backendConfig();
    const apiEndpoint = envApiEndpoint || backend?.apiEndpoint || DEFAULT_API_ENDPOINT;
    const planes = derivePlaneEndpoints(apiEndpoint, dbName);

    // The dev server reads .env.local (NEXT_PUBLIC_DB_NAME + per-DB endpoint
    // overrides so it doesn't fall back to localhost vhosts on a remote
    // backend); the codegen config reads process.env (passed directly below).
    try {
      await writeFile(path.join(appDir, '.env.local'), envLocalContent(dbName, planes));
    } catch (err) {
      return fail(
        `Failed to write packages/app/.env.local: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // Hoist the graphql override to the root workspace (PNPM-GRAPHQL-OVERRIDE-001)
    // and pin codegen to latest (TS-001) before the single clean install. When
    // prewarmed by provision_database these are idempotent and the install is a
    // fast no-op; otherwise this is the first install (PNPM-BUILDS-001).
    await ensureWorkspaceConfig(cwd);
    await pinCodegenLatest(appDir);

    const install = await run('pnpm', ['install', '--no-frozen-lockfile'], cwd, undefined, ctx.signal);
    if (!install.ok && !IGNORED_BUILDS_RE.test(install.out)) {
      return fail(`pnpm install failed:\n${install.out}`);
    }

    const codegen = await runCodegenWithRetry(appDir, {
      NEXT_PUBLIC_DB_NAME: dbName,
      ...(planes ? codegenEndpointEnv(planes) : {}),
    }, ctx.signal);
    if (!codegen.ok) {
      // A reset that survives every internal retry is a backend OUTAGE, not a code
      // or install problem — re-running run_codegen cannot fix it. Say so explicitly
      // so the agent marks sdk-codegen `blocked` instead of looping the tool to the
      // time cap (CODEGEN-OUTAGE-001 / THRASH-001).
      if (FETCH_RESET_RE.test(codegen.out)) {
        return fail(
          'codegen failed: BACKEND OUTAGE — the Constructive backend reset the connection ' +
            'during schema introspection, and it stayed down across every internal retry. ' +
            'This is an EXTERNAL outage, not a code or install problem; re-running run_codegen ' +
            'will NOT fix it. Call run_preflight once — if the backend is down, mark ' +
            'sdk-codegen `blocked` (SERVER-001, BLOCKED-PROCEED-001) and hand back to ' +
            'build-orchestrator. Do NOT loop on run_codegen (THRASH-001).\n\n' +
            codegen.out,
        );
      }
      return fail(`codegen failed:\n${codegen.out}`);
    }

    // Normalize directory barrels so Turbopack can resolve them (TURBOPACK-BARREL-001).
    const sdkRoot = path.join(appDir, 'src', 'graphql', 'sdk');
    const barrelsRewritten = normalizeSdkBarrels(sdkRoot);

    // Report which app submodules actually generated — a bare scaffold with only
    // index.ts means codegen had no schema to generate against.
    const appSdk = path.join(sdkRoot, 'app');
    const generatedSubmodules = ['hooks', 'orm', 'types'].filter((sub) =>
      existsSync(path.join(appSdk, sub)),
    );

    const message =
      generatedSubmodules.length > 0
        ? `Codegen complete. Generated app submodules: ${generatedSubmodules.join(', ')}. Normalized ${barrelsRewritten} barrel file(s).`
        : `Codegen ran, but no app submodules (hooks/orm/types) were generated — the database may have no entity tables yet. Normalized ${barrelsRewritten} barrel file(s).`;

    return {
      content: [{ type: 'text', text: message }],
      details: {
        success: generatedSubmodules.length > 0,
        message,
        barrelsRewritten,
        generatedSubmodules,
      },
    };
  },
};

// Re-exported so provision_database can prewarm the same deterministic scaffold +
// install concurrently with its backend mutation (kept off run_codegen's path).
export { prewarmAppWorkspace };
