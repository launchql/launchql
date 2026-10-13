import { MAX_LIST_ENTRIES, MAX_READ_BYTES } from '@constructive-db/machine-protocol';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { listPath, PathAccessError, readPath, RunnerPolicy } from '../src';

let base: string;
let policy: RunnerPolicy;

/** The refusal a call made, as `{ code, message }`. */
async function refusal(call: Promise<unknown>): Promise<{ code: string; message: string }> {
  try {
    await call;
  } catch (err) {
    if (!(err instanceof PathAccessError)) throw err;
    return { code: err.code, message: err.message };
  }
  throw new Error('expected a PathAccessError');
}

beforeAll(() => {
  base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'runner-files-')));
  // policy root: base/root; the tree under test: base/root/tree; and a
  // sibling of the tree (still inside the policy root) and a directory outside
  // the policy root altogether, for symlinks to point at.
  fs.mkdirSync(path.join(base, 'root', 'tree', 'src'), { recursive: true });
  fs.mkdirSync(path.join(base, 'root', 'sibling'), { recursive: true });
  fs.mkdirSync(path.join(base, 'outside'), { recursive: true });
  fs.writeFileSync(path.join(base, 'root', 'tree', 'README.md'), '# hello\n');
  fs.writeFileSync(path.join(base, 'root', 'tree', 'src', 'index.ts'), 'export {};\n');
  fs.writeFileSync(path.join(base, 'root', 'sibling', 'secret.txt'), 'sibling\n');
  fs.writeFileSync(path.join(base, 'outside', 'secret.txt'), 'outside\n');
  fs.symlinkSync('src/index.ts', path.join(base, 'root', 'tree', 'inner-link'));
  fs.symlinkSync(path.join(base, 'outside'), path.join(base, 'root', 'tree', 'out-link'));
  fs.symlinkSync('../sibling/secret.txt', path.join(base, 'root', 'tree', 'sibling-link'));
  policy = { allowedCommands: [], cwd: path.join(base, 'root') };
});

afterAll(() => {
  fs.rmSync(base, { recursive: true, force: true });
});

describe('listing a directory under a root', () => {
  it('lists the root, sorted, reporting symlinks as symlinks', async () => {
    expect(await listPath(policy, 'tree', '')).toEqual([
      { name: 'README.md', kind: 'file', size: 8 },
      { name: 'inner-link', kind: 'symlink' },
      { name: 'out-link', kind: 'symlink' },
      { name: 'sibling-link', kind: 'symlink' },
      { name: 'src', kind: 'directory' }
    ]);
  });

  it('lists a subdirectory, and the policy cwd when no root is named', async () => {
    expect(await listPath(policy, 'tree', 'src')).toEqual([
      { name: 'index.ts', kind: 'file', size: 11 }
    ]);
    expect((await listPath(policy, undefined, '.')).map(entry => entry.name)).toEqual([
      'sibling',
      'tree'
    ]);
  });

  it('refuses a directory with more entries than the limit', async () => {
    const big = path.join(base, 'root', 'big');
    fs.mkdirSync(big);
    for (let i = 0; i <= MAX_LIST_ENTRIES; i++) fs.writeFileSync(path.join(big, `f${i}`), '');
    expect(await refusal(listPath(policy, 'big', ''))).toMatchObject({
      code: 'DIRECTORY_TOO_LARGE'
    });
    fs.rmSync(path.join(big, 'f0'));
    expect(await listPath(policy, 'big', '')).toHaveLength(MAX_LIST_ENTRIES);
    fs.rmSync(big, { recursive: true });
  });

  it('refuses a file', async () => {
    expect(await refusal(listPath(policy, 'tree', 'README.md'))).toMatchObject({
      code: 'NOT_A_DIRECTORY'
    });
  });
});

describe('reading a file under a root', () => {
  it('reads a file, and a symlink that stays inside the root', async () => {
    expect(await readPath(policy, 'tree', 'README.md')).toEqual({
      data: Buffer.from('# hello\n').toString('base64'),
      size: 8
    });
    expect(Buffer.from((await readPath(policy, 'tree', 'inner-link')).data, 'base64').toString()).toBe(
      'export {};\n'
    );
  });

  it('refuses a file over the limit, and reads one at it', async () => {
    const at = path.join(base, 'root', 'tree', 'at-limit.bin');
    fs.writeFileSync(at, Buffer.alloc(MAX_READ_BYTES, 1));
    expect((await readPath(policy, 'tree', 'at-limit.bin')).size).toBe(MAX_READ_BYTES);
    fs.appendFileSync(at, Buffer.alloc(1));
    expect(await refusal(readPath(policy, 'tree', 'at-limit.bin'))).toMatchObject({
      code: 'FILE_TOO_LARGE'
    });
    fs.rmSync(at);
  });

  it('refuses a directory, and a path that does not exist', async () => {
    expect(await refusal(readPath(policy, 'tree', 'src'))).toMatchObject({ code: 'NOT_A_FILE' });
    expect(await refusal(readPath(policy, 'tree', 'nope.txt'))).toMatchObject({
      code: 'PATH_NOT_FOUND'
    });
  });
});

describe('a request is confined to its root', () => {
  it.each([
    ['../sibling/secret.txt'],
    ['src/../../sibling/secret.txt'],
    ['..'],
    ['src\\..\\..\\sibling']
  ])('refuses traversal: %s', async requested => {
    expect(await refusal(readPath(policy, 'tree', requested))).toMatchObject({
      code: 'PATH_INVALID',
      message: expect.stringMatching(/traverses/)
    });
    expect(await refusal(listPath(policy, 'tree', requested))).toMatchObject({
      code: 'PATH_INVALID'
    });
  });

  it.each([['/etc/passwd'], ['\\etc\\passwd'], ['C:/Windows']])(
    'refuses an absolute path: %s',
    async requested => {
      expect(await refusal(readPath(policy, 'tree', requested))).toMatchObject({
        code: 'PATH_INVALID',
        message: expect.stringMatching(/absolute/)
      });
    }
  );

  it('refuses a NUL byte', async () => {
    expect(await refusal(readPath(policy, 'tree', 'README.md\0.txt'))).toMatchObject({
      code: 'PATH_INVALID'
    });
  });

  it('refuses a symlink out of the policy cwd, for a read, a listing and a path through it', async () => {
    expect(await refusal(listPath(policy, 'tree', 'out-link'))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
    expect(await refusal(readPath(policy, 'tree', 'out-link/secret.txt'))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
  });

  it('refuses a symlink to a sibling of the root, though the policy cwd contains both', async () => {
    expect(await refusal(readPath(policy, 'tree', 'sibling-link'))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
  });

  it('refuses a root outside the policy cwd', async () => {
    expect(await refusal(listPath(policy, '../outside', ''))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
    expect(await refusal(listPath(policy, path.join(base, 'outside'), ''))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
  });

  it('refuses a root that is a symlink out of the policy cwd', async () => {
    const link = path.join(base, 'root', 'root-link');
    fs.symlinkSync(path.join(base, 'outside'), link);
    expect(await refusal(readPath(policy, 'root-link', 'secret.txt'))).toMatchObject({
      code: 'PATH_OUTSIDE_ROOT'
    });
    fs.rmSync(link);
  });
});
