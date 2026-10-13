// Read-only access to paths under the policy cwd. The relay names a root (the
// same kind of value an `open` frame's `cwd` is: relative to, and confined to,
// the policy cwd) and a path relative to that root; the runner answers with a
// listing or a file's bytes. Nothing here knows what the root is for.

import {
  MAX_LIST_ENTRIES,
  MAX_READ_BYTES,
  PathEntry,
  PathErrorCode,
  relativePathProblem
} from '@constructive-db/machine-protocol';
import { constants } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { PolicyViolationError, resolveCwd, RunnerPolicy } from './policy';

/** A path request refused for a reason the requester can act on. */
export class PathAccessError extends Error {
  constructor(
    readonly code: PathErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PathAccessError';
  }
}

/** An errno failure as a refusal; anything else is a bug and propagates. */
function fsFailure(err: unknown, requested: string): PathAccessError {
  const errno = (err as NodeJS.ErrnoException)?.code;
  if (typeof errno !== 'string') throw err;
  if (errno === 'ENOENT' || errno === 'ENOTDIR') {
    return new PathAccessError('PATH_NOT_FOUND', `'${requested}' does not exist`);
  }
  return new PathAccessError(
    'PATH_UNREADABLE',
    `'${requested}' could not be read: ${(err as Error).message}`
  );
}

/**
 * The real path `requested` names under `root`. Refuses an absolute or
 * traversing path outright, a root outside the policy cwd, and — after
 * resolving every symlink — a target that is not the root or inside it.
 */
export async function resolveUnder(
  policy: RunnerPolicy,
  root: string | undefined,
  requested: string
): Promise<string> {
  const problem = relativePathProblem(requested);
  if (problem) throw new PathAccessError('PATH_INVALID', `path '${requested}' ${problem}`);
  let base: string;
  try {
    base = resolveCwd(policy, root);
  } catch (err) {
    if (!(err instanceof PolicyViolationError)) throw err;
    throw new PathAccessError('PATH_OUTSIDE_ROOT', err.message);
  }
  let realBase: string;
  try {
    realBase = await fs.realpath(base);
  } catch (err) {
    throw fsFailure(err, root ?? '.');
  }
  let real: string;
  try {
    real = await fs.realpath(path.join(base, requested));
  } catch (err) {
    throw fsFailure(err, requested);
  }
  if (real !== realBase && !real.startsWith(realBase + path.sep)) {
    throw new PathAccessError('PATH_OUTSIDE_ROOT', `'${requested}' resolves outside its root`);
  }
  return real;
}

function entryKind(entry: { isFile(): boolean; isDirectory(): boolean; isSymbolicLink(): boolean }) {
  if (entry.isSymbolicLink()) return 'symlink' as const;
  if (entry.isFile()) return 'file' as const;
  if (entry.isDirectory()) return 'directory' as const;
  return 'other' as const;
}

/**
 * The entries of a directory under `root`, sorted by name. A directory with
 * more than {@link MAX_LIST_ENTRIES} entries is refused, not truncated, and is
 * not read past the limit.
 */
export async function listPath(
  policy: RunnerPolicy,
  root: string | undefined,
  requested: string
): Promise<PathEntry[]> {
  const target = await resolveUnder(policy, root, requested);
  let dir;
  try {
    const stat = await fs.stat(target);
    if (!stat.isDirectory()) {
      throw new PathAccessError('NOT_A_DIRECTORY', `'${requested}' is not a directory`);
    }
    dir = await fs.opendir(target);
  } catch (err) {
    if (err instanceof PathAccessError) throw err;
    throw fsFailure(err, requested);
  }
  const entries: PathEntry[] = [];
  try {
    for await (const dirent of dir) {
      if (entries.length === MAX_LIST_ENTRIES) {
        throw new PathAccessError(
          'DIRECTORY_TOO_LARGE',
          `'${requested}' has more than ${MAX_LIST_ENTRIES} entries`
        );
      }
      const kind = entryKind(dirent);
      const entry: PathEntry = { name: dirent.name, kind };
      if (kind === 'file') entry.size = (await fs.lstat(path.join(target, dirent.name))).size;
      entries.push(entry);
    }
  } catch (err) {
    // Throwing out of `for await` closes the directory handle.
    if (err instanceof PathAccessError) throw err;
    throw fsFailure(err, requested);
  }
  return entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * A file's bytes, base64. A file over {@link MAX_READ_BYTES} is refused, not
 * truncated — including one that grew past the limit after it was measured.
 * The final component is opened `O_NOFOLLOW`, so a symlink swapped in after
 * {@link resolveUnder} looked is refused rather than followed.
 */
export async function readPath(
  policy: RunnerPolicy,
  root: string | undefined,
  requested: string
): Promise<{ data: string; size: number }> {
  const target = await resolveUnder(policy, root, requested);
  let handle;
  try {
    const stat = await fs.stat(target);
    if (!stat.isFile()) throw new PathAccessError('NOT_A_FILE', `'${requested}' is not a file`);
    if (stat.size > MAX_READ_BYTES) {
      throw new PathAccessError(
        'FILE_TOO_LARGE',
        `'${requested}' is ${stat.size} bytes; the limit is ${MAX_READ_BYTES}`
      );
    }
    handle = await fs.open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (err) {
    if (err instanceof PathAccessError) throw err;
    throw fsFailure(err, requested);
  }
  try {
    const buffer = Buffer.alloc(MAX_READ_BYTES + 1);
    let size = 0;
    for (;;) {
      const { bytesRead } = await handle.read(buffer, size, buffer.length - size, size);
      if (bytesRead === 0) break;
      size += bytesRead;
      if (size > MAX_READ_BYTES) {
        throw new PathAccessError(
          'FILE_TOO_LARGE',
          `'${requested}' grew past the ${MAX_READ_BYTES}-byte limit while being read`
        );
      }
    }
    return { data: buffer.subarray(0, size).toString('base64'), size };
  } catch (err) {
    if (err instanceof PathAccessError) throw err;
    throw fsFailure(err, requested);
  } finally {
    await handle.close();
  }
}
