import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
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

export async function run(
  cmd: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
  signal?: AbortSignal,
): Promise<{ ok: boolean; out: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd,
      signal,
      timeout: 5 * 60_000,
      encoding: 'utf-8',
      maxBuffer: 32 * 1024 * 1024,
      env: env ? { ...process.env, ...env } : process.env,
    });
    return { ok: true, out: `${stdout}${stderr}`.trim() };
  } catch (err) {
    signal?.throwIfAborted();
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
  signal?: AbortSignal,
): Promise<{ ok: boolean; out: string }> {
  const appDir = path.join(cwd, 'packages', 'app');
  if (existsSync(path.join(appDir, 'package.json'))) {
    return { ok: true, out: 'packages/app already scaffolded' };
  }

  const tmp = path.join(os.tmpdir(), `airpage-app-template-${process.pid}`);
  await rm(tmp, { recursive: true, force: true });
  let clone: { ok: boolean; out: string };
  try {
    clone = await run('git', ['clone', '--depth', '1', TEMPLATE_REPO, tmp], cwd, undefined, signal);
  } catch (err) {
    await rm(tmp, { recursive: true, force: true });
    throw err;
  }
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

// Scaffold packages/app, hoist the workspace config, pin codegen, and run the one
// clean install. All of this is database-INDEPENDENT, so it can be prewarmed
// concurrently with the ~90s provision_database backend mutation to keep clone +
// install off run_codegen's critical path. Best-effort and fully idempotent:
// run_codegen re-runs the same steps, finding the scaffold present and the install
// already satisfied (a fast no-op). Errors are swallowed by callers that prewarm —
// run_codegen surfaces any real failure later.
export async function prewarmAppWorkspace(
  cwd: string,
  signal?: AbortSignal,
): Promise<{ ok: boolean; out: string }> {
  const scaffold = await ensureAppScaffold(cwd, signal);
  if (!scaffold.ok) return scaffold;

  const appDir = path.join(cwd, 'packages', 'app');
  await ensureWorkspaceConfig(cwd);
  await pinCodegenLatest(appDir);

  const install = await run('pnpm', ['install', '--no-frozen-lockfile'], cwd, undefined, signal);
  if (!install.ok && !IGNORED_BUILDS_RE.test(install.out)) {
    return { ok: false, out: `pnpm install failed:\n${install.out}` };
  }
  return { ok: true, out: 'Prewarmed packages/app scaffold + install.' };
}
