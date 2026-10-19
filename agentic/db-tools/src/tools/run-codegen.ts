import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import {
  detectAppKind,
  ensureAppScaffold,
  ensureComposedInstall,
  ensureWorkspaceConfig,
  IGNORED_BUILDS_RE,
  pinCodegenLatest,
  prewarmAppWorkspace,
  run,
  type RunCommand,
  settlePrewarm,
} from '../app-workspace';
import { getHost } from '../host';
import { readEnv } from '../provision-database/env-file';
import { normalizeSdkBarrels } from '../run-codegen/barrels';
import { codegenEndpointEnv, derivePlaneEndpoints, envLocalContent } from '../run-codegen/endpoints';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';

const RunCodegenZod = z.object({});
type Params = z.infer<typeof RunCodegenZod>;

/** Wall-clock milliseconds per step; a step that didn't run reports 0. */
export type RunCodegenTimings = {
  scaffoldMs: number;
  installMs: number;
  codegenMs: number;
  barrelsMs: number;
  totalMs: number;
};

export type RunCodegenDetails = {
  success: boolean;
  message: string;
  barrelsRewritten?: number;
  generatedSubmodules?: string[];
  /** `composed` when packages/app carries .constructive/compose.json. */
  appKind?: 'composed' | 'template';
  /** False when a composed app's node_modules was already there. */
  installed?: boolean;
  codegenAttempts?: number;
  timings?: RunCodegenTimings;
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: RunCodegenDetails };

function fail(message: string, extra?: Omit<RunCodegenDetails, 'success' | 'message'>): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    details: { ...extra, success: false, message },
  };
}

const FETCH_RESET_RE = /Failed to fetch schema|Connection reset|ECONNRESET|socket hang up/i;

// Read the binding provision_database wrote to the project .env. The
// API_ENDPOINT pin identifies which backend owns the binding — it wins over
// the app's current backend config, matching context.ts data-plane precedence.
async function readProjectEnv(
  cwd: string,
): Promise<{ databaseName?: string; apiEndpoint?: string }> {
  try {
    const env = readEnv(await readFile(path.join(cwd, '.env'), 'utf8'));
    return {
      databaseName: env.DATABASE_NAME?.trim() || undefined,
      apiEndpoint: env.API_ENDPOINT?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CODEGEN_ARGS = ['generate', '--config', './graphql-codegen.config.ts'];

// The template flow resolves codegen through npx. A composed app runs the codegen
// its lockfile pinned: the linked bin, or the app's own `codegen` script when the
// bin isn't linked, so nothing is resolved over the network.
function codegenCommand(appDir: string, composed: boolean): { cmd: string; args: string[] } {
  if (!composed) return { cmd: 'npx', args: ['@constructive-io/graphql-codegen', ...CODEGEN_ARGS] };
  const bin = path.join(appDir, 'node_modules', '.bin', 'graphql-codegen');
  return existsSync(bin) ? { cmd: bin, args: CODEGEN_ARGS } : { cmd: 'pnpm', args: ['run', 'codegen'] };
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
  exec: RunCommand,
  composed: boolean,
  attempts = 4,
): Promise<{ ok: boolean; out: string; attempts: number }> {
  const sdk = path.join(appDir, 'src', 'graphql', 'sdk');
  const { cmd, args } = codegenCommand(appDir, composed);
  let last: { ok: boolean; out: string } = { ok: false, out: 'codegen never ran' };
  for (let i = 1; i <= attempts; i++) {
    // A composed app ships SDK stubs so it builds before codegen; codegen prunes
    // its own stale files, so the stubs stay until a run replaces them.
    if (!composed) {
      for (const sub of ['admin', 'auth', 'app']) {
        await rm(path.join(sdk, sub), { recursive: true, force: true });
      }
    }
    last = await exec(cmd, args, appDir, env);
    if (last.ok || !FETCH_RESET_RE.test(last.out)) return { ...last, attempts: i };
    if (i < attempts) await sleep(2000 * i);
  }
  return { ...last, attempts };
}

// `exec` runs every child process (clone, install, codegen); tests inject it.
export function createRunCodegenTool(
  exec: RunCommand = run,
): HarnessTool<typeof RunCodegenZod, RunCodegenDetails> {
  return {
    name: 'run_codegen',
    label: 'Run codegen',
    description:
      "Generate the typed GraphQL SDK for the project's Next.js app (packages/app). Runs the exact deterministic sequence — scaffold packages/app from the constructive-app template if it doesn't exist yet, hoist the graphql override to the root workspace so a single grafast resolves, pin codegen to latest, do one clean install, run codegen (retrying transient backend connection resets), and normalize SDK barrels for Turbopack. A composed app (packages/app/.constructive/compose.json) skips the scaffold and those fixups: it installs from its own lockfile only when node_modules is missing and runs its local codegen. Run AFTER provisioning the database and creating schema; it scaffolds packages/app itself, so no separate `pgpm init` step is needed. The scaffold + install are usually prewarmed during provision_database, so this is fast.",
    promptSnippet:
      'run_codegen: scaffold packages/app (if missing) + regenerate the typed SDK (workspace-config + clean install + codegen-with-retry + barrel-normalize; a composed app keeps its lockfile and local codegen). Run after schema changes. Gated.',
    parameters: RunCodegenZod,
    async execute(_params: Params, ctx): Promise<ToolResult> {
      const started = Date.now();
      const since = (t: number) => Date.now() - t;
      const cwd = ctx.cwd;
      const appDir = path.join(cwd, 'packages', 'app');
      // A prewarm provision_database started may still be installing; let it
      // finish so this run's install never races it.
      await settlePrewarm(cwd);
      const app = detectAppKind(appDir);
      if (app.kind === 'invalid') {
        return fail(`${app.reason} Recompose packages/app, or remove the marker to use the template flow.`);
      }
      const composed = app.kind === 'composed';
      const appKind: RunCodegenDetails['appKind'] = composed ? 'composed' : 'template';
      const timings: RunCodegenTimings = {
        scaffoldMs: 0,
        installMs: 0,
        codegenMs: 0,
        barrelsMs: 0,
        totalMs: 0,
      };
      let installed: boolean | undefined;
      let codegenAttempts: number | undefined;
      const stepDetails = () => ({
        appKind,
        installed,
        codegenAttempts,
        timings: { ...timings, totalMs: since(started) },
      });

      // Materialize packages/app deterministically if it isn't there yet — this
      // replaces the flaky `pgpm init` scaffold step (PGPM-001). When
      // provision_database prewarmed it, this no-ops.
      if (!composed) {
        const t = Date.now();
        const scaffold = await ensureAppScaffold(cwd, exec);
        timings.scaffoldMs = since(t);
        if (!scaffold.ok) {
          return fail(scaffold.out, stepDetails());
        }
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

      const tInstall = Date.now();
      if (composed) {
        const install = await ensureComposedInstall(cwd, exec);
        timings.installMs = since(tInstall);
        installed = install.installed;
        if (!install.ok) {
          return fail(install.out, stepDetails());
        }
      } else {
        // Hoist the graphql override to the root workspace (PNPM-GRAPHQL-OVERRIDE-001)
        // and pin codegen to latest (TS-001) before the single clean install. When
        // prewarmed by provision_database these are idempotent and the install is a
        // fast no-op; otherwise this is the first install (PNPM-BUILDS-001).
        await ensureWorkspaceConfig(cwd);
        await pinCodegenLatest(appDir);

        const install = await exec('pnpm', ['install', '--no-frozen-lockfile'], cwd);
        timings.installMs = since(tInstall);
        installed = true;
        if (!install.ok && !IGNORED_BUILDS_RE.test(install.out)) {
          return fail(`pnpm install failed:\n${install.out}`, stepDetails());
        }
      }

      const tCodegen = Date.now();
      const codegen = await runCodegenWithRetry(
        appDir,
        {
          NEXT_PUBLIC_DB_NAME: dbName,
          ...(planes ? codegenEndpointEnv(planes) : {}),
        },
        exec,
        composed,
      );
      timings.codegenMs = since(tCodegen);
      codegenAttempts = codegen.attempts;
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
            stepDetails(),
          );
        }
        return fail(`codegen failed:\n${codegen.out}`, stepDetails());
      }

      // Normalize directory barrels so Turbopack can resolve them (TURBOPACK-BARREL-001).
      // Only directories that exist are rewritten, so a config without an admin
      // target leaves nothing pointing at one.
      const tBarrels = Date.now();
      const sdkRoot = path.join(appDir, 'src', 'graphql', 'sdk');
      const barrelsRewritten = normalizeSdkBarrels(sdkRoot);
      timings.barrelsMs = since(tBarrels);

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
          ...stepDetails(),
        },
      };
    },
  };
}

export const runCodegenTool = createRunCodegenTool();

// Re-exported so provision_database can prewarm the same deterministic scaffold +
// install concurrently with its backend mutation (kept off run_codegen's path).
export { prewarmAppWorkspace };
