import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The app API check after a refused codegen; classification stays real.
jest.mock('../src/graphql-http', () => ({
  ...jest.requireActual('../src/graphql-http'),
  postGraphQL: jest.fn(),
}));

import { prewarmAppWorkspace, type RunCommand } from '../src/app-workspace';
import { postGraphQL } from '../src/graphql-http';
import { configureHost } from '../src/host';
import { createRunCodegenTool } from '../src/tools/run-codegen';

const mockPost = postGraphQL as jest.MockedFunction<typeof postGraphQL>;

type Call = { cmd: string; args: string[]; cwd: string; env?: Record<string, string> };

const CODEGEN_ENV = {
  NEXT_PUBLIC_DB_NAME: 'myapp',
  CODEGEN_ADMIN_ENDPOINT: 'http://admin-myapp.localhost:3000/graphql',
  CODEGEN_ADMIN_HOST: 'admin-myapp.localhost:3000',
  CODEGEN_AUTH_ENDPOINT: 'http://auth-myapp.localhost:3000/graphql',
  CODEGEN_AUTH_HOST: 'auth-myapp.localhost:3000',
  CODEGEN_APP_ENDPOINT: 'http://api-myapp.localhost:3000/graphql',
  CODEGEN_APP_HOST: 'api-myapp.localhost:3000',
};

const ENV_LOCAL =
  'NEXT_PUBLIC_DB_NAME=myapp\n' +
  'NEXT_PUBLIC_ADMIN_ENDPOINT=http://admin-myapp.localhost:3000/graphql\n' +
  'NEXT_PUBLIC_AUTH_ENDPOINT=http://auth-myapp.localhost:3000/graphql\n' +
  'NEXT_PUBLIC_APP_ENDPOINT=http://api-myapp.localhost:3000/graphql\n';

const STUB = '// stub until codegen runs\nexport {};\n';

let cwd: string;
let appDir: string;

function write(file: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const read = (file: string) => readFileSync(file, 'utf8');

// A composed packages/app: pinned codegen, its own lockfile, the marker, and
// SDK stubs for its two targets (no admin target).
function composedApp(opts: { nodeModules?: boolean; ownWorkspace?: boolean } = {}) {
  write(
    path.join(appDir, 'package.json'),
    `${JSON.stringify({ name: 'app', devDependencies: { '@constructive-io/graphql-codegen': '4.50.0' } }, null, 2)}\n`,
  );
  write(path.join(appDir, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n");
  write(path.join(appDir, '.constructive', 'compose.json'), '{"templateSha":"abc"}\n');
  write(path.join(appDir, 'src', 'graphql', 'sdk', 'app', 'index.ts'), STUB);
  write(path.join(appDir, 'src', 'graphql', 'sdk', 'auth', 'index.ts'), STUB);
  if (opts.ownWorkspace) {
    write(path.join(appDir, 'pnpm-workspace.yaml'), 'onlyBuiltDependencies:\n  - esbuild\n');
  }
  if (opts.nodeModules) markInstalled();
}

// What a finished pnpm install leaves: its .modules.yaml and the linked bins.
function markInstalled() {
  write(path.join(appDir, 'node_modules', '.modules.yaml'), 'layoutVersion: 5\n');
  write(path.join(appDir, 'node_modules', '.bin', 'graphql-codegen'), '');
}

// What codegen writes for an auth + app config: per-target directory barrels and
// a root barrel over the targets that exist.
function writeGeneratedSdk() {
  const sdk = path.join(appDir, 'src', 'graphql', 'sdk');
  write(path.join(sdk, 'index.ts'), "export * as auth from './auth';\nexport * as app from './app';\n");
  write(path.join(sdk, 'auth', 'index.ts'), "export * from './orm';\n");
  write(path.join(sdk, 'auth', 'orm', 'index.ts'), 'export const authOrm = 1;\n');
  write(path.join(sdk, 'app', 'index.ts'), "export * from './orm';\nexport * from './hooks';\n");
  write(path.join(sdk, 'app', 'orm', 'index.ts'), 'export const appOrm = 1;\n');
  write(path.join(sdk, 'app', 'hooks', 'index.ts'), 'export const appHooks = 1;\n');
}

function fakeExec(handle: (call: Call) => { ok: boolean; out: string } = () => ({ ok: true, out: '' })) {
  const calls: Call[] = [];
  const exec: RunCommand = async (cmd, args, cwd, env) => {
    const call = { cmd, args, cwd, env };
    calls.push(call);
    return handle(call);
  };
  return { exec, calls };
}

const isCodegen = (call: Call) =>
  call.cmd.endsWith('graphql-codegen') || call.cmd === 'npx' || call.args.includes('codegen');

function untouchedFiles() {
  return {
    packageJson: read(path.join(appDir, 'package.json')),
    lockfile: read(path.join(appDir, 'pnpm-lock.yaml')),
  };
}

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), 'db-tools-codegen-'));
  appDir = path.join(cwd, 'packages', 'app');
  write(path.join(cwd, '.env'), 'DATABASE_NAME=myapp\n');
  configureHost({
    account: () => null,
    backendConfig: () => ({ apiEndpoint: 'http://api.localhost:3000/graphql' }),
  });
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe('run_codegen on a composed app', () => {
  it('runs the local codegen bin without scaffolding, installing, or touching package.json and the lockfile', async () => {
    composedApp({ nodeModules: true });
    const before = untouchedFiles();
    const { exec, calls } = fakeExec((call) => {
      if (isCodegen(call)) writeGeneratedSdk();
      return { ok: true, out: '' };
    });

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    expect(calls).toEqual([
      {
        cmd: path.join(appDir, 'node_modules', '.bin', 'graphql-codegen'),
        args: ['generate', '--config', './graphql-codegen.config.ts'],
        cwd: appDir,
        env: CODEGEN_ENV,
      },
    ]);
    expect(untouchedFiles()).toEqual(before);
    expect(existsSync(path.join(cwd, 'pnpm-workspace.yaml'))).toBe(false);
    expect(read(path.join(appDir, '.env.local'))).toBe(ENV_LOCAL);
    expect(result.details).toMatchObject({
      success: true,
      appKind: 'composed',
      installed: false,
      codegenAttempts: 1,
      generatedSubmodules: ['hooks', 'orm'],
    });
    expect(Object.keys(result.details.timings ?? {})).toEqual([
      'scaffoldMs',
      'installMs',
      'codegenMs',
      'barrelsMs',
      'totalMs',
    ]);
  });

  it('tolerates a config without an admin target and normalizes only the barrels that exist', async () => {
    composedApp({ nodeModules: true });
    const { exec } = fakeExec((call) => {
      if (isCodegen(call)) writeGeneratedSdk();
      return { ok: true, out: '' };
    });

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    const sdk = path.join(appDir, 'src', 'graphql', 'sdk');
    expect(result.details.success).toBe(true);
    expect(existsSync(path.join(sdk, 'admin'))).toBe(false);
    expect(read(path.join(sdk, 'index.ts'))).toBe(
      "export * as auth from './auth/index';\nexport * as app from './app/index';\n",
    );
    expect(read(path.join(sdk, 'app', 'index.ts'))).toBe(
      "export * from './orm/index';\nexport * from './hooks/index';\n",
    );
    expect(result.details.barrelsRewritten).toBe(3);
  });

  it('installs from the lockfile, frozen and offline-first, when node_modules is missing', async () => {
    composedApp({ ownWorkspace: true });
    const workspace = read(path.join(appDir, 'pnpm-workspace.yaml'));
    const before = untouchedFiles();
    const { exec, calls } = fakeExec((call) => {
      if (isCodegen(call)) writeGeneratedSdk();
      return { ok: true, out: '' };
    });

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    // Without a linked bin, the app's own codegen script runs; never npx.
    expect(calls.map(({ cmd, args, cwd }) => ({ cmd, args, cwd }))).toEqual([
      { cmd: 'pnpm', args: ['install', '--frozen-lockfile', '--prefer-offline'], cwd: appDir },
      { cmd: 'pnpm', args: ['run', 'codegen'], cwd: appDir },
    ]);
    expect(calls[1].env).toEqual(CODEGEN_ENV);
    expect(untouchedFiles()).toEqual(before);
    expect(read(path.join(appDir, 'pnpm-workspace.yaml'))).toBe(workspace);
    expect(result.details).toMatchObject({ success: true, installed: true });
  });

  it('installs again after a failed install left node_modules half-made', async () => {
    composedApp();
    let installs = 0;
    const { exec, calls } = fakeExec((call) => {
      if (call.args[0] === 'install') {
        // pnpm got as far as creating node_modules, then failed.
        write(path.join(appDir, 'node_modules', 'next', 'package.json'), '{}');
        if (++installs === 1) return { ok: false, out: 'ERR_PNPM_FETCH_404' };
        markInstalled();
        return { ok: true, out: '' };
      }
      if (isCodegen(call)) writeGeneratedSdk();
      return { ok: true, out: '' };
    });
    const tool = createRunCodegenTool(exec);

    const first = await tool.execute({}, { cwd });
    const second = await tool.execute({}, { cwd });

    expect(first.details).toMatchObject({ success: false, installed: true });
    expect(second.details).toMatchObject({ success: true, installed: true });
    expect(calls.filter((call) => call.args[0] === 'install')).toHaveLength(2);
  });

  it.each([
    ['has no lockfile', () => rmSync(path.join(appDir, 'pnpm-lock.yaml')), /no pnpm-lock\.yaml/],
    ['has a marker that is not JSON', () => write(path.join(appDir, '.constructive', 'compose.json'), '{'), /not valid JSON/],
  ])('refuses an app that %s, and leaves it alone', async (_case, breakApp, reason) => {
    composedApp({ nodeModules: true });
    breakApp();
    const packageJson = read(path.join(appDir, 'package.json'));
    const { exec, calls } = fakeExec();

    const result = await createRunCodegenTool(exec).execute({}, { cwd });
    const prewarm = await prewarmAppWorkspace(cwd, exec);

    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(reason);
    expect(prewarm.ok).toBe(false);
    expect(calls).toEqual([]);
    expect(read(path.join(appDir, 'package.json'))).toBe(packageJson);
    expect(existsSync(path.join(cwd, 'pnpm-workspace.yaml'))).toBe(false);
  });

  it('keeps the SDK stubs when codegen fails, so the app still builds', async () => {
    composedApp({ nodeModules: true });
    const { exec } = fakeExec(() => ({ ok: false, out: 'GraphQL error: permission denied' }));

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    expect(result.details).toMatchObject({ success: false, appKind: 'composed', codegenAttempts: 1 });
    expect(result.details.timings?.codegenMs).toEqual(expect.any(Number));
    expect(read(path.join(appDir, 'src', 'graphql', 'sdk', 'app', 'index.ts'))).toBe(STUB);
  });
});

describe('run_codegen when the app API refuses', () => {
  const refused = () => fakeExec((call) => ({ ok: !isCodegen(call), out: 'Failed to fetch schema: HTTP 403 Forbidden' }));

  it('stops at the first 403 and reports a deleted or suspended database', async () => {
    composedApp({ nodeModules: true });
    mockPost.mockResolvedValue({
      httpStatus: 403,
      data: null,
      errors: [{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED', httpStatus: 403 } }],
    });
    const { exec, calls } = refused();

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    expect(calls.filter(isCodegen)).toHaveLength(1);
    expect(mockPost).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'http://api-myapp.localhost:3000/graphql' }),
    );
    expect(result.details).toMatchObject({ success: false, code: 'database-unavailable', codegenAttempts: 1 });
  });

  it('keeps a 403 from a database that is up a plain codegen failure', async () => {
    composedApp({ nodeModules: true });
    mockPost.mockResolvedValue({ httpStatus: 200, data: { __typename: 'Query' }, errors: [] });
    const { exec, calls } = refused();

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    expect(calls.filter(isCodegen)).toHaveLength(1);
    expect(result.details).toMatchObject({ success: false, codegenAttempts: 1 });
    expect(result.details.code).toBeUndefined();
  });
});

describe('prewarmAppWorkspace on a composed app', () => {
  it('only installs, and keeps a root workspace from capturing the app install', async () => {
    composedApp();
    const rootWorkspace = 'packages:\n  - "packages/*"\n';
    write(path.join(cwd, 'pnpm-workspace.yaml'), rootWorkspace);
    const before = untouchedFiles();
    const { exec, calls } = fakeExec();

    const result = await prewarmAppWorkspace(cwd, exec);

    expect(result.ok).toBe(true);
    expect(calls).toEqual([
      {
        cmd: 'pnpm',
        args: ['install', '--frozen-lockfile', '--prefer-offline', '--ignore-workspace'],
        cwd: appDir,
        env: undefined,
      },
    ]);
    expect(untouchedFiles()).toEqual(before);
    expect(read(path.join(cwd, 'pnpm-workspace.yaml'))).toBe(rootWorkspace);
  });

  it('does nothing when node_modules is already there', async () => {
    composedApp({ nodeModules: true });
    const { exec, calls } = fakeExec();

    await expect(prewarmAppWorkspace(cwd, exec)).resolves.toMatchObject({ ok: true });
    expect(calls).toEqual([]);
  });
});

describe('run_codegen on a constructive-app template', () => {
  it('still hoists the workspace config, pins codegen to latest, and runs npx', async () => {
    write(
      path.join(appDir, 'package.json'),
      JSON.stringify({ devDependencies: { '@constructive-io/graphql-codegen': '^4.9.0' } }),
    );
    write(path.join(appDir, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n");
    const { exec, calls } = fakeExec((call) => {
      if (isCodegen(call)) writeGeneratedSdk();
      return { ok: true, out: '' };
    });

    const result = await createRunCodegenTool(exec).execute({}, { cwd });

    expect(calls.map(({ cmd, args, cwd }) => ({ cmd, args, cwd }))).toEqual([
      { cmd: 'pnpm', args: ['install', '--no-frozen-lockfile'], cwd },
      {
        cmd: 'npx',
        args: ['@constructive-io/graphql-codegen', 'generate', '--config', './graphql-codegen.config.ts'],
        cwd: appDir,
      },
    ]);
    expect(JSON.parse(read(path.join(appDir, 'package.json'))).devDependencies).toEqual({
      '@constructive-io/graphql-codegen': 'latest',
    });
    expect(existsSync(path.join(appDir, 'pnpm-workspace.yaml'))).toBe(false);
    expect(read(path.join(cwd, 'pnpm-workspace.yaml'))).toContain('packages:\n  - "packages/*"');
    expect(result.details).toMatchObject({ success: true, appKind: 'template', installed: true });
  });
});
