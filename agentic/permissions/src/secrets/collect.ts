/** Read the secret values out of the secret files in the workspace. */

import * as path from 'node:path';

import { isSecretFileName } from '../secret-files';
import type { FsProbe } from '../types';
import { parseSecretFile, secretValuesOf } from './parse';

/** Dirs never walked: dependencies, VCS data, and build output. */
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.turbo', 'dist', 'build', 'coverage']);
const MAX_DEPTH = 4;
const MAX_FILE_BYTES = 256 * 1024;
const MAX_DIRS = 5000;

export interface CollectedSecrets {
  values: { name: string; value: string; file: string }[];
  errors: { file: string; error: unknown }[];
}

/**
 * Read the secret files in the workspace dirs (the root and nested, to depth 4,
 * skipping dependencies and build output, files up to 256 KB). Sibling dirs are
 * walked in parallel, since a refresh runs after every tool that can write.
 */
export async function collectWorkspaceSecrets(dirs: readonly string[], fs: FsProbe): Promise<CollectedSecrets> {
  const result: CollectedSecrets = { values: [], errors: [] };
  const files: string[] = [];
  let visited = 0;

  const walk = async (dir: string, depth: number): Promise<void> => {
    if (visited++ >= MAX_DIRS) return;
    let entries: Awaited<ReturnType<FsProbe['readDir']>>;
    try {
      entries = await fs.readDir(dir);
    } catch (error) {
      if (depth === 0) result.errors.push({ file: dir, error });
      return;
    }
    const subdirs: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.kind === 'dir') {
        if (!SKIP_DIRS.has(entry.name) && depth + 1 < MAX_DEPTH) subdirs.push(full);
      } else if ((entry.kind === 'file' || entry.kind === 'symlink') && isSecretFileName(entry.name)) {
        files.push(full);
      }
    }
    await Promise.all(subdirs.map((sub) => walk(sub, depth + 1)));
  };

  await Promise.all(dirs.map((dir) => walk(dir, 0)));

  await Promise.all(
    files.map(async (file) => {
      try {
        if ((await fs.size(file)) > MAX_FILE_BYTES) return;
        const text = await fs.readFile(file);
        if (text.includes('\u0000')) return;
        for (const v of secretValuesOf(parseSecretFile(path.basename(file), text))) result.values.push({ ...v, file });
      } catch (error) {
        result.errors.push({ file, error });
      }
    })
  );
  return result;
}
