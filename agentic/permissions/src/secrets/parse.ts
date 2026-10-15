/** The `KEY → value` pairs in a secret file, by its format (dotenv, ini, JSON, netrc, …). */

import { isEnvFileName } from '../secret-files';
import { isSecretEntry, isTrivial, urlPasswordOf } from './rules';

export interface ParsedValue {
  key: string;
  /** The value as a program sees it. */
  value: string;
  /** The value as written in the file, when it differs (escapes inside double quotes). */
  raw?: string;
}

function unescapeDouble(s: string): string {
  return s.replace(/\\([nrt"\\$`])/g, (_m, c: string) => ({ n: '\n', r: '\r', t: '\t' })[c] ?? c);
}

/** Parse dotenv text (`KEY=value`, `export KEY=…`, quoted and multi-line quoted values). */
export function parseDotenv(text: string): ParsedValue[] {
  const out: ParsedValue[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s?(.*)$/.exec(lines[i]);
    if (!m) continue;
    const key = m[1];
    let rest = m[2].trimStart();
    const quote = rest[0];
    if (quote === '"' || quote === "'" || quote === '`') {
      rest = rest.slice(1);
      let body = '';
      let closed = false;
      for (;;) {
        let end = -1;
        for (let k = 0; k < rest.length; k++) {
          if (quote === '"' && rest[k] === '\\') k++;
          else if (rest[k] === quote) {
            end = k;
            break;
          }
        }
        if (end >= 0) {
          body += rest.slice(0, end);
          closed = true;
          break;
        }
        body += rest;
        if (i + 1 >= lines.length) break;
        body += '\n';
        rest = lines[++i];
      }
      if (!closed) continue;
      const value = quote === '"' ? unescapeDouble(body) : body;
      out.push(value === body ? { key, value } : { key, value, raw: body });
      continue;
    }
    const value = rest.replace(/\s+#.*$/, '').trim();
    out.push({ key, value });
  }
  return out;
}

/** `key=value`, `key = value` and `key: value` lines (npmrc, pypirc, boto, aws credentials). */
function parseIni(text: string): ParsedValue[] {
  const out: ParsedValue[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*[#;[]/.test(line)) continue;
    const m = /^\s*([^=:#\s][^=]*?)\s*[=:]\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    out.push({ key: m[1], value: m[2].replace(/^(['"])(.*)\1$/, '$2') });
  }
  return out;
}

function walkJson(node: unknown, key: string, out: ParsedValue[], depth = 0): void {
  if (depth > 32) return;
  if (typeof node === 'string') out.push({ key, value: node });
  else if (Array.isArray(node)) node.forEach((item) => walkJson(item, key, out, depth + 1));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walkJson(v, k, out, depth + 1);
  }
}

/** The `KEY → value` pairs in one secret file, by its name. Unknown formats give `[]`. */
export function parseSecretFile(fileName: string, text: string): ParsedValue[] {
  const name = fileName.toLowerCase();
  if (isEnvFileName(name)) return parseDotenv(text);
  if (name.endsWith('.json') || name === '.dockercfg' || name.endsWith('.tfstate') || name.endsWith('.tfstate.backup')) {
    try {
      const out: ParsedValue[] = [];
      walkJson(JSON.parse(text), 'SECRET', out);
      return out;
    } catch {
      return [];
    }
  }
  if (name === '.netrc') {
    return [...text.matchAll(/\bpassword\s+(\S+)/g)].map((m) => ({ key: 'NETRC_PASSWORD', value: m[1] }));
  }
  if (name === '.pgpass') {
    return text
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => ({ key: 'PGPASSWORD', value: l.split(/(?<!\\):/).pop() ?? '' }));
  }
  if (name === '.htpasswd') {
    return text
      .split(/\r?\n/)
      .filter((l) => l.includes(':'))
      .map((l) => ({ key: 'HTPASSWD', value: l.slice(l.indexOf(':') + 1) }));
  }
  if (name === '.git-credentials') {
    return [...text.matchAll(/:\/\/[^\s/:@]*:([^\s/@]+)@/g)].map((m) => ({ key: 'GIT_PASSWORD', value: m[1] }));
  }
  if (['.npmrc', '.pypirc', '.boto', '.s3cfg', 'credentials'].includes(name) || name.endsWith('.tfvars')) {
    return parseIni(text);
  }
  return [];
}

/** The secret values among parsed pairs, named after their keys. URL passwords count on their own. */
export function secretValuesOf(pairs: readonly ParsedValue[]): { name: string; value: string }[] {
  const out: { name: string; value: string }[] = [];
  for (const pair of pairs) {
    if (isSecretEntry(pair.key, pair.value)) {
      out.push({ name: pair.key, value: pair.value });
      if (pair.raw) out.push({ name: pair.key, value: pair.raw });
    }
    const pw = urlPasswordOf(pair.value);
    if (pw && !isTrivial(pw)) {
      out.push({ name: pair.key, value: pw });
      try {
        const decoded = decodeURIComponent(pw);
        if (decoded !== pw && !isTrivial(decoded)) out.push({ name: pair.key, value: decoded });
      } catch {
        // malformed percent-encoding: the raw form is already in
      }
    }
  }
  return out;
}
