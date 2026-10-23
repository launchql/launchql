import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// pnpm 11.8 no longer reads the `pnpm` field from a non-root package.json, so the
// template's `pnpm.overrides.graphql` (in packages/app/package.json) is silently
// ignored. Without that override two graphql versions (16.13.0 + 16.14.0) get
// installed, which instantiates two copies of `grafast` under DIFFERENT
// peer-dependency hash contexts. graphile-search then resolves in one context
// while graphile-connection-filter was linked under the other, so codegen dies
// with `Cannot find module 'graphile-connection-filter'`. Hoisting the override
// to the ROOT pnpm-workspace.yaml (which pnpm 11.8 DOES read) collapses graphql —
// and therefore grafast — to a single version, and the missing module resolves
// (PNPM-GRAPHQL-OVERRIDE-001). We also strip the nested packages/app
// pnpm-workspace.yaml the template ships, and keep onlyBuiltDependencies so the
// native deps build where honored (PNPM-BUILDS-001).
export const NATIVE_BUILD_DEPS = ['esbuild', 'sharp', 'unrs-resolver'];
export const IGNORED_BUILDS_RE = /ERR_PNPM_IGNORED_BUILDS|Ignored build scripts/;
const DEFAULT_GRAPHQL_OVERRIDE = '16.14.0';

const TEMPLATE_REPO = 'https://github.com/constructive-io/sandbox-templates';
const TEMPLATE_SUBDIR = path.join('nextjs', 'constructive-app');

// A composed app carries this marker, written when its template was composed.
// It ships its own pinned package.json and pnpm-lock.yaml, so none of the
// constructive-app fixups below apply to it.
export const COMPOSE_MARKER = path.join('.constructive', 'compose.json');

export type AppKind =
  | { kind: 'composed' }
  | { kind: 'template' }
  | { kind: 'invalid'; reason: string };

/**
 * Which flow packages/app takes. Composed needs the marker to be a JSON object
 * and the app's own lockfile beside it. A marker that fails either check is
 * neither: running the template fixups would rewrite a composed app, so
 * callers stop and report the reason instead.
 */
export function detectAppKind(appDir: string): AppKind {
  const marker = path.join(appDir, COMPOSE_MARKER);
  if (!existsSync(marker)) return { kind: 'template' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(marker, 'utf8'));
  } catch {
    return { kind: 'invalid', reason: `packages/app/${COMPOSE_MARKER} is not valid JSON.` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { kind: 'invalid', reason: `packages/app/${COMPOSE_MARKER} is not a JSON object.` };
  }
  if (!existsSync(path.join(appDir, 'pnpm-lock.yaml'))) {
    return {
      kind: 'invalid',
      reason: `packages/app has ${COMPOSE_MARKER} but no pnpm-lock.yaml, so it can't be installed as composed.`,
    };
  }
  return { kind: 'composed' };
}

export type RunCommand = (
  cmd: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
) => Promise<{ ok: boolean; out: string }>;

export async function run(
  cmd: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
): Promise<{ ok: boolean; out: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd,
      timeout: 5 * 60_000,
      encoding: 'utf-8',
      maxBuffer: 32 * 1024 * 1024,
      env: env ? { ...process.env, ...env } : process.env,
    });
    return { ok: true, out: `${stdout}${stderr}`.trim() };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}`.trim() || e.message || 'failed' };
  }
}

// Read the graphql pin the template wants from its (now-ignored) pnpm.overrides
// so we propagate the template's own value instead of hardcoding ours.
async function templateGraphqlOverride(cwd: string): Promise<string> {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(cwd, 'packages', 'app', 'package.json'), 'utf8'),
    );
    const v = pkg?.pnpm?.overrides?.graphql;
    return typeof v === 'string' && v.length > 0 ? v : DEFAULT_GRAPHQL_OVERRIDE;
  } catch {
    return DEFAULT_GRAPHQL_OVERRIDE;
  }
}

export async function ensureWorkspaceConfig(cwd: string): Promise<void> {
  const nested = path.join(cwd, 'packages', 'app', 'pnpm-workspace.yaml');
  if (existsSync(nested)) {
    await rm(nested, { force: true });
  }

  const graphqlPin = await templateGraphqlOverride(cwd);
  const builds = NATIVE_BUILD_DEPS.map((d) => `  - ${d}`).join('\n');
  const text =
    `packages:\n  - "packages/*"\n\n` +
    `overrides:\n  graphql: ${graphqlPin}\n\n` +
    `onlyBuiltDependencies:\n${builds}\n`;

  await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), text);
}

// Force @constructive-io/graphql-codegen to `latest` in the app package.json
// before the single install — older 4.9.x throws on PostGraphile `filter` inputs
// (TS-001).
export async function pinCodegenLatest(appDir: string): Promise<void> {
  const pkgPath = path.join(appDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  for (const field of ['devDependencies', 'dependencies'] as const) {
    if (pkg[field]?.['@constructive-io/graphql-codegen']) {
      pkg[field]['@constructive-io/graphql-codegen'] = 'latest';
    }
  }
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

// The Constructive Next.js app is just the `nextjs/constructive-app` tree from
// the sandbox-templates repo — it ships no `____VAR____` placeholders, so there
// is nothing to templatize. `pgpm init` only fetches and copies that tree, but
// its CLI is unreliable in the non-TTY agent shell, which made the agent thrash
// for minutes. Materialize `packages/app` deterministically by shallow-cloning
// the template instead (PGPM-001).
export async function ensureAppScaffold(
  cwd: string,
  exec: RunCommand = run,
): Promise<{ ok: boolean; out: string }> {
  const appDir = path.join(cwd, 'packages', 'app');
  if (existsSync(path.join(appDir, 'package.json'))) {
    return { ok: true, out: 'packages/app already scaffolded' };
  }

  const tmp = path.join(os.tmpdir(), `airpage-app-template-${process.pid}`);
  await rm(tmp, { recursive: true, force: true });
  const clone = await exec('git', ['clone', '--depth', '1', TEMPLATE_REPO, tmp], cwd);
  if (!clone.ok) {
    await rm(tmp, { recursive: true, force: true });
    return { ok: false, out: `Template clone failed:\n${clone.out}` };
  }

  const src = path.join(tmp, TEMPLATE_SUBDIR);
  if (!existsSync(src)) {
    await rm(tmp, { recursive: true, force: true });
    return { ok: false, out: `Template subdir ${TEMPLATE_SUBDIR} missing in ${TEMPLATE_REPO}` };
  }

  try {
    await mkdir(path.dirname(appDir), { recursive: true });
    await cp(src, appDir, { recursive: true });
  } catch (err) {
    await rm(tmp, { recursive: true, force: true });
    return {
      ok: false,
      out: `Copying template into packages/app failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  await rm(tmp, { recursive: true, force: true });
  return { ok: true, out: 'Scaffolded packages/app from the constructive-app template.' };
}

// pnpm writes node_modules/.modules.yaml once an install finishes linking, so a
// partial install (interrupted, or failed mid-way) lacks it. Codegen also
// needs its bin, so both must be there to skip the install.
function composedInstallComplete(appDir: string): boolean {
  const modules = path.join(appDir, 'node_modules');
  return (
    existsSync(path.join(modules, '.modules.yaml')) &&
    existsSync(path.join(modules, '.bin', 'graphql-codegen'))
  );
}

// Install a composed app exactly as its lockfile pins it, unless a finished
// install is already there. The install runs in packages/app against its own
// lockfile, from the store where it can. A nested pnpm-workspace.yaml makes the
// app its own workspace root, so the config is left alone; without one, a root
// pnpm-workspace.yaml would pull the install up to the project root, where no
// lockfile exists, so pnpm is told to ignore it instead of rewriting it.
export async function ensureComposedInstall(
  cwd: string,
  exec: RunCommand = run,
): Promise<{ ok: boolean; out: string; installed: boolean }> {
  const appDir = path.join(cwd, 'packages', 'app');
  if (composedInstallComplete(appDir)) {
    return { ok: true, out: 'packages/app dependencies already installed.', installed: false };
  }

  const args = ['install', '--frozen-lockfile', '--prefer-offline'];
  const ownsWorkspace = existsSync(path.join(appDir, 'pnpm-workspace.yaml'));
  if (!ownsWorkspace && existsSync(path.join(cwd, 'pnpm-workspace.yaml'))) {
    args.push('--ignore-workspace');
  }
  const install = await exec('pnpm', args, appDir);
  if (!install.ok && !IGNORED_BUILDS_RE.test(install.out)) {
    return { ok: false, out: `pnpm install failed:\n${install.out}`, installed: true };
  }
  return { ok: true, out: 'Installed packages/app from its lockfile.', installed: true };
}

// Scaffold packages/app, hoist the workspace config, pin codegen, and run the one
// clean install. All of this is database-INDEPENDENT, so it can be prewarmed
// concurrently with the ~90s provision_database backend mutation to keep clone +
// install off run_codegen's critical path. Best-effort and fully idempotent:
// run_codegen re-runs the same steps, finding the scaffold present and the install
// already satisfied (a fast no-op). Errors are swallowed by callers that prewarm —
// run_codegen surfaces any real failure later. A composed app only gets its
// frozen install, and an invalid marker leaves the app untouched.
//
// One prewarm runs per project at a time: a call while one is in flight gets
// that same run, so a retried provision_database (or run_codegen, via
// settlePrewarm) never starts a second install beside it.
const prewarmsInFlight = new Map<string, Promise<{ ok: boolean; out: string }>>();

export function prewarmAppWorkspace(
  cwd: string,
  exec: RunCommand = run,
): Promise<{ ok: boolean; out: string }> {
  const key = path.resolve(cwd);
  const inFlight = prewarmsInFlight.get(key);
  if (inFlight) return inFlight;
  const started = prewarm(cwd, exec).finally(() => prewarmsInFlight.delete(key));
  prewarmsInFlight.set(key, started);
  return started;
}

/** Wait for a prewarm still running for `cwd`; its outcome doesn't matter here. */
export async function settlePrewarm(cwd: string): Promise<void> {
  await prewarmsInFlight.get(path.resolve(cwd))?.catch((): void => undefined);
}

async function prewarm(cwd: string, exec: RunCommand): Promise<{ ok: boolean; out: string }> {
  const appDir = path.join(cwd, 'packages', 'app');
  const app = detectAppKind(appDir);
  if (app.kind === 'invalid') return { ok: false, out: app.reason };
  if (app.kind === 'composed') {
    const install = await ensureComposedInstall(cwd, exec);
    return install.ok ? { ok: true, out: 'Prewarmed packages/app install.' } : install;
  }

  const scaffold = await ensureAppScaffold(cwd, exec);
  if (!scaffold.ok) return scaffold;

  await ensureWorkspaceConfig(cwd);
  await pinCodegenLatest(appDir);

  const install = await exec('pnpm', ['install', '--no-frozen-lockfile'], cwd);
  if (!install.ok && !IGNORED_BUILDS_RE.test(install.out)) {
    return { ok: false, out: `pnpm install failed:\n${install.out}` };
  }
  return { ok: true, out: 'Prewarmed packages/app scaffold + install.' };
}
