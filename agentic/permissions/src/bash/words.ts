/** Small predicates on argument text, shared by the analyzer and the command rules. */

/** Has a `/`, or starts with `.` or `~`: the agent meant a path. */
export function isPathLike(text: string): boolean {
  return text.includes('/') || text.startsWith('.') || text.startsWith('~');
}

/** A network URL (`https://…`, `ssh://…`). `file://` is a path, not a URL. */
export function isUrl(text: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(text) && !/^file:\/\//i.test(text);
}

/** `host:path`, `user@host:path`, `rsync://…`; not `./a:b` or `/a:b`. */
export function isRemoteSpec(text: string): boolean {
  if (/^rsync:\/\//i.test(text)) return true;
  if (text.startsWith('/') || text.startsWith('.') || text.startsWith('~')) return false;
  const colon = text.indexOf(':');
  const slash = text.indexOf('/');
  return colon > 0 && (slash < 0 || colon < slash);
}

/** `localhost`, `127.x.x.x`, `::1` and `*.localhost`: reachable only from this machine. */
export function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  return h === 'localhost' || h === '::1' || /^127\.\d+\.\d+\.\d+$/.test(h) || h.endsWith('.localhost');
}
