import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { createPermissionEngine, nodeFsProbe, type PermissionVerdict } from '../src';
import { canonicalize, resolveLikePi } from '../src/paths';
import { makeSandbox, type Sandbox } from './sandbox';

let sb: Sandbox;

beforeAll(async () => {
  sb = await makeSandbox();
  // A link to a dir that does not exist, outside the project.
  await fs.symlink('/etc/agentic-perm-missing-dir', path.join(sb.ws, 'escape'));
  // A dangling link inside the project.
  await fs.symlink(path.join(sb.ws, 'gone'), path.join(sb.ws, 'dangling'));
  // A link that leaves the project to an existing folder.
  await fs.symlink(path.join(sb.home, 'work', 'lib'), path.join(sb.ws, 'lib-link'));
});
afterAll(() => sb.cleanup());

type Row = [tool: string, input: Record<string, unknown>, ask: PermissionVerdict, workspace: PermissionVerdict, full: PermissionVerdict];

// prettier-ignore
const rows: Row[] = [
  // issue #194 probe set
  ['read', { path: '.env' }, 'allow', 'allow', 'allow'],
  ['read', { path: '~/.ssh/id_ed25519' }, 'deny', 'deny', 'deny'],
  ['read', { path: '~/.aws/credentials' }, 'deny', 'deny', 'deny'],
  ['write', { path: '/etc/hosts', content: '127.0.0.1 x' }, 'ask', 'ask', 'allow'],
  ['grep', { pattern: 'SECRET', path: '/' }, 'ask', 'ask', 'allow'],
  // precedence: reads, writes, protected, ask-write
  ['read', { path: 'src/config.ts' }, 'allow', 'allow', 'allow'],
  ['ls', {}, 'allow', 'allow', 'allow'],
  ['write', { path: 'src/new.ts', content: 'x' }, 'ask', 'allow', 'allow'],
  ['edit', { path: 'src/config.ts', edits: [{ oldText: '{}', newText: '{ a: 1 }' }] }, 'ask', 'allow', 'allow'],
  ['write', { path: '.pi/extensions/x.ts', content: 'x' }, 'deny', 'deny', 'deny'],
  ['read', { path: '.pi/settings.json' }, 'allow', 'allow', 'allow'],
  ['edit', { path: '.git/config', edits: [{ oldText: 'a', newText: 'b' }] }, 'ask', 'ask', 'allow'],
  ['write', { path: '.husky/pre-commit', content: 'x' }, 'ask', 'ask', 'allow'],
  ['write', { path: '.envrc', content: 'x' }, 'ask', 'ask', 'allow'],
  ['write', { path: '.vscode/tasks.json', content: '{}' }, 'ask', 'ask', 'allow'],
  // path escapes
  ['read', { path: 'src/../../lib/util.ts' }, 'ask', 'ask', 'allow'],
  ['read', { path: 'lib-link/util.ts' }, 'ask', 'ask', 'allow'],
  ['read', { path: '@.env' }, 'allow', 'allow', 'allow'],
  ['read', { path: 'file:///etc/hosts' }, 'ask', 'ask', 'allow'],
  ['write', { path: 'escape/payload.sh', content: 'x' }, 'ask', 'ask', 'ask'],
  ['read', { path: 'dangling' }, 'ask', 'ask', 'ask'],
  ['read', {}, 'ask', 'ask', 'ask'],
  // the scratch (temp) dir
  ['write', { path: '$SCRATCH/x.txt', content: 'x' }, 'ask', 'allow', 'allow']
];

describe('file tools per mode', () => {
  it.each(rows)('%s %j', async (tool, input, ask, workspace, full) => {
    const verdicts = [];
    for (const mode of ['ask', 'workspace', 'full'] as const) {
      const real = typeof input.path === 'string' ? { ...input, path: input.path.replace('$SCRATCH', sb.scratch) } : input;
      verdicts.push((await sb.run(tool, real, mode)).decision);
    }
    expect(verdicts).toEqual([ask, workspace, full]);
  });

  it('abstains on tools it does not own', async () => {
    expect(await sb.run('create_api_key', { name: 'x' })).toBeNull();
  });

  it('names what it blocks', async () => {
    const read = await sb.run('read', { path: '~/.ssh/id_ed25519' });
    expect(read.reason).toBe('permissions: reading ~/.ssh/id_ed25519 is not allowed (SSH keys; blocked in every mode)');
    const write = await sb.run('write', { path: '.pi/extensions/x.ts', content: 'x' });
    expect(write.reason).toBe(
      'permissions: writing .pi/extensions/x.ts is not allowed (agent extension dir; protected in every mode)'
    );
    const outside = await sb.run('write', { path: '/etc/hosts', content: 'x' });
    expect(outside.reason).toBe('permissions: writing /etc/hosts needs approval: /etc/hosts is outside the project');
  });

  it('marks a read of a secret file and keeps the target canonical', async () => {
    const d = await sb.run('read', { path: 'lib-link/../.env' });
    // pi resolves `..` lexically, so this is the project .env.
    expect(d.request.targets[0]).toMatchObject({ path: path.join(sb.ws, '.env'), zone: 'workspace', secretFile: true });
    expect(d.request.signals).toContain('secret-file');
  });

  it('flags a grep glob that names secret files without blocking it', async () => {
    const d = await sb.run('grep', { pattern: 'KEY', glob: '**/.env*' });
    expect(d.decision).toBe('allow');
    expect(d.request.signals).toContain('secret-file');
  });
});

describe('path resolution', () => {
  it('matches pi: one @, unicode spaces, ~, file://', () => {
    expect(resolveLikePi('@@x', '/w', '/h')).toBe('/w/@x');
    expect(resolveLikePi('my\u00A0file\u202Fname.txt', '/w', '/h')).toBe('/w/my file name.txt');
    expect(resolveLikePi('~', '/w', '/h')).toBe('/h');
    expect(resolveLikePi('~/a/../b', '/w', '/h')).toBe('/h/b');
    expect(resolveLikePi('~user/x', '/w', '/h')).toBe('/w/~user/x');
    expect(resolveLikePi('file:///etc/hosts', '/w', '/h')).toBe('/etc/hosts');
    expect(resolveLikePi('file://remote-host/x', '/w', '/h')).toBeNull();
  });

  it('canonicalizes through links, keeps missing tails, and refuses dangling links', async () => {
    const libReal = path.join(sb.home, 'work', 'lib');
    expect(await canonicalize(path.join(sb.ws, 'lib-link', 'new', 'file.ts'), nodeFsProbe)).toBe(
      path.join(libReal, 'new', 'file.ts')
    );
    // `..` after a link is physical, the way a shell opens it.
    expect(await canonicalize(`${sb.ws}/lib-link/../app/.env`, nodeFsProbe)).toBe(path.join(sb.ws, '.env'));
    expect(await canonicalize(path.join(sb.ws, 'dangling'), nodeFsProbe)).toBeNull();
    expect(await canonicalize(path.join(sb.ws, 'escape', 'payload.sh'), nodeFsProbe)).toBeNull();
  });

  (process.platform === 'darwin' ? it : it.skip)('treats /tmp and /private/tmp as the same place', async () => {
    const dir = await fs.mkdtemp('/tmp/agentic-perm-tmp-');
    try {
      const engine = createPermissionEngine({ cwd: dir, homeDir: sb.home, roots: { temp: [] } });
      const via = async (p: string) =>
        (await engine.evaluate({ toolCallId: p, toolName: 'read', input: { path: p } }, { mode: 'workspace', grants: [] }))
          .request.targets[0].zone;
      expect(await via(`${dir}/a.txt`)).toBe('workspace');
      expect(await via(`/private${dir}/a.txt`)).toBe('workspace');
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
