/**
 * Path handling that matches what the tools will actually open.
 *
 * `resolveLikePi` copies pi's `resolveToCwd` (`utils/paths.ts`), so the engine
 * classifies the same absolute path the tool reads or writes. `canonicalize`
 * then follows symlinks the way the kernel will, so a link inside the project
 * that points at `~/.ssh` is judged as `~/.ssh`.
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { FsProbe } from './types';

const UNICODE_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

/** macOS and Windows file systems are case-insensitive by default. */
export const CASE_INSENSITIVE_FS = process.platform === 'darwin' || process.platform === 'win32';

/**
 * pi's resolution for a tool `path` argument: normalize unicode spaces, strip
 * one leading `@`, expand `~` and `~/`, accept `file://` URLs, then resolve
 * against the cwd. Returns `null` when the input cannot name a local path (a
 * malformed `file://` URL), which the caller treats as unresolvable.
 */
export function resolveLikePi(raw: string, cwd: string, homeDir: string): string | null {
  let normalized = raw.replace(UNICODE_SPACES, ' ');
  if (normalized.startsWith('@')) normalized = normalized.slice(1);
  if (normalized === '~') return path.resolve(homeDir);
  if (normalized.startsWith('~/')) return path.resolve(homeDir, normalized.slice(2));
  if (/^file:\/\//.test(normalized)) {
    try {
      normalized = fileURLToPath(normalized);
    } catch {
      return null;
    }
  }
  return path.isAbsolute(normalized) ? path.resolve(normalized) : path.resolve(cwd, normalized);
}

/**
 * The real location of `absolute`: realpath the deepest ancestor that exists,
 * then add the missing tail again. `absolute` may hold `..` segments; they are
 * resolved physically (after the symlinks before them), the way a shell's
 * `open()` resolves them.
 *
 * Returns `null` (unresolvable) when some entry on the way exists but cannot be
 * resolved: a dangling symlink, a link loop, or an entry we may not inspect. A
 * write there would follow the link somewhere we cannot see.
 */
export async function canonicalize(absolute: string, fs: FsProbe): Promise<string | null> {
  if (!path.isAbsolute(absolute)) return null;
  const tail: string[] = [];
  let current = absolute;
  for (let depth = 0; depth < 4096; depth++) {
    try {
      const real = await fs.realpath(current);
      return path.resolve(real, ...tail);
    } catch {
      // fall through: does the entry itself exist?
    }
    if (await fs.lexists(current)) return null;
    const parent = path.dirname(current);
    if (parent === current) return null;
    tail.unshift(path.basename(current));
    current = parent;
  }
  return null;
}

function fold(p: string, caseInsensitive: boolean): string {
  return caseInsensitive ? p.toLowerCase() : p;
}

/** `p` is `root` or inside it. Both must be absolute and normalized. */
export function contains(root: string, p: string, caseInsensitive = false): boolean {
  const rel = path.relative(fold(root, caseInsensitive), fold(p, caseInsensitive));
  if (rel === '') return true;
  return rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
}

/** The deepest directory that holds every path (the parent of a single path). */
export function commonParent(paths: readonly string[]): string {
  if (paths.length === 0) return path.sep;
  let prefix = path.dirname(paths[0]);
  for (const p of paths.slice(1)) {
    while (!contains(prefix, p) || prefix === p) {
      const parent = path.dirname(prefix);
      if (parent === prefix) return prefix;
      prefix = parent;
    }
  }
  return prefix;
}

/**
 * `~/…` for paths under the home dir, the absolute path otherwise. On macOS
 * `/private/etc`, `/private/tmp` and `/private/var` show as `/etc`, `/tmp`
 * and `/var`, the names people use for them.
 */
export function displayPath(p: string, homeDir: string): string {
  const home = path.resolve(homeDir);
  if (p === home) return '~';
  if (contains(home, p)) return `~/${path.relative(home, p)}`;
  if (process.platform === 'darwin' && /^\/private\/(etc|tmp|var)(\/|$)/.test(p)) return p.slice('/private'.length);
  return p;
}

/** Display form for a directory, with a trailing separator. */
export function displayDir(p: string, homeDir: string): string {
  const shown = displayPath(p, homeDir);
  return shown.endsWith('/') ? shown : `${shown}/`;
}

/** How a path reads on a card and in a reason: project-relative inside the workspace, `~/…` otherwise. */
export function showPath(p: string, workspace: string | undefined, homeDir: string): string {
  if (workspace && p !== workspace && contains(workspace, p)) return path.relative(workspace, p);
  return displayPath(p, homeDir);
}
