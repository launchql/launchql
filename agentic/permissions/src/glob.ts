/**
 * Whether a path with an unexpanded glob can expand into a root. Bash expands
 * `*`, `?` and `[…]` one path component at a time, so the pattern is matched
 * component by component against the root's own path. A pattern that reaches
 * the root can name the root or anything inside it.
 */

export const GLOB_CHARS = /[*?[]/;

export interface GlobOptions {
  /** `*` and `?` match a leading `.` (bash `dotglob`). */
  dot: boolean;
  /** Compare case-insensitively (macOS and Windows file systems). */
  caseInsensitive: boolean;
}

function escape(ch: string): string {
  return ch.replace(/[.+^${}()|\\\]]/g, '\\$&');
}

/** One component as a regex; `null` when it cannot be compiled (match anything then). */
function componentRegex(c: string, ci: boolean): RegExp | null {
  let re = '';
  for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else if (ch === '[') {
      const close = c.indexOf(']', i + 2);
      if (close < 0) {
        re += '\\[';
        continue;
      }
      const body = c
        .slice(i + 1, close)
        .replace(/\\/g, '\\\\')
        .replace(/^(!?)\]/, '$1\\]');
      re += `[${body.startsWith('!') ? `^${body.slice(1)}` : body}]`;
      i = close;
    } else re += escape(ch);
  }
  try {
    return new RegExp(`^${re}$`, ci ? 'i' : '');
  } catch {
    return null;
  }
}

function componentMatches(pattern: string, name: string, opts: GlobOptions): boolean {
  if (!GLOB_CHARS.test(pattern)) {
    return opts.caseInsensitive ? pattern.toLowerCase() === name.toLowerCase() : pattern === name;
  }
  if (name.startsWith('.') && !pattern.startsWith('.') && !opts.dot) return false;
  const re = componentRegex(pattern, opts.caseInsensitive);
  return re === null || re.test(name);
}

function reach(pattern: readonly string[], i: number, root: readonly string[], j: number, opts: GlobOptions): boolean {
  if (j === root.length) return true;
  if (i === pattern.length) return false;
  if (pattern[i] === '**') {
    // globstar: zero or more whole components.
    if (reach(pattern, i + 1, root, j, opts)) return true;
    return (opts.dot || !root[j].startsWith('.')) && reach(pattern, i, root, j + 1, opts);
  }
  return componentMatches(pattern[i], root[j], opts) && reach(pattern, i + 1, root, j + 1, opts);
}

/** `pattern` (absolute, `..` already resolved) can expand to `root` or a path inside it. */
export function globReaches(pattern: string, root: string, opts: GlobOptions): boolean {
  const parts = (p: string) => p.split('/').filter(Boolean);
  return reach(parts(pattern), 0, parts(root), 0, opts);
}
