/**
 * The Node implementation of `FsProbe`. The only module that imports `node:fs`,
 * so everything else stays pure and testable with a fake.
 */

import { promises as fs } from 'node:fs';

import type { DirEntry, FsProbe } from './types';

function isMissing(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException)?.code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

export const nodeFsProbe: FsProbe = {
  realpath: (p) => fs.realpath(p),
  async lexists(p) {
    try {
      await fs.lstat(p);
      return true;
    } catch (error) {
      // Anything but "missing" (EACCES, ELOOP) counts as present, so the
      // path is treated as unresolvable instead of silently skipped.
      return !isMissing(error);
    }
  },
  readFile: (p) => fs.readFile(p, 'utf8'),
  async readDir(p) {
    const entries = await fs.readdir(p, { withFileTypes: true });
    return entries.map(
      (e): DirEntry => ({
        name: e.name,
        kind: e.isDirectory() ? 'dir' : e.isFile() ? 'file' : e.isSymbolicLink() ? 'symlink' : 'other'
      })
    );
  },
  async size(p) {
    return (await fs.stat(p)).size;
  }
};
