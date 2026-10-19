// Pure .env edits — used by provision_database to persist provisioning
// credentials without clobbering existing keys.
// Kept side-effect-free so it is unit-testable (the tool does the fs write).
//
// Reads go through the same parser context.ts uses (quotes, `export`,
// comments, the last definition wins), and edits find a key the way that
// parser does, so a key written as `export KEY="value"` or spread over several
// lines by a quoted value is still the key being replaced or removed.

import { parseDotenv } from '12factor-env/dotenv';

export type EnvVars = Record<string, string>;

/** Parse .env text: quoted values, `export` prefixes and comments; last definition wins. */
export function readEnv(content: string): EnvVars {
  return parseDotenv(content);
}

const ENTRY_RE = /^(\s*)(export\s+)?([\w.-]+)\s*=\s*(.*)$/;
const QUOTES = new Set(['"', "'", '`']);

type EnvEntry = { key: string | null; exported: boolean; lines: string[] };

// Group lines into entries: a key with the lines its value spans (a quoted
// value left open continues to the line that closes it), or a non-entry line
// (comment, blank, anything else) with a null key.
function envEntries(content: string): EnvEntry[] {
  const lines = content.split('\n');
  const entries: EnvEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.trimStart().startsWith('#') ? null : ENTRY_RE.exec(line);
    if (!match) {
      entries.push({ key: null, exported: false, lines: [line] });
      continue;
    }
    const value = match[4];
    const span = [line];
    if (QUOTES.has(value[0]) && !value.slice(1).includes(value[0])) {
      while (i + 1 < lines.length) {
        span.push(lines[++i]);
        if (lines[i].includes(value[0])) break;
      }
    }
    entries.push({ key: match[3], exported: !!match[2], lines: span });
  }
  return entries;
}

/**
 * Upsert `vars` into the existing `.env` `content`. An existing key is
 * replaced in place (keeping an `export` prefix), and any later definition of
 * it is dropped so the new value is the one that wins; new keys are appended.
 * Returns the new file body, trailing-newline-terminated.
 */
export function mergeEnv(content: string, vars: EnvVars): string {
  const remaining = new Map(Object.entries(vars));
  const written = new Set<string>();
  const out: string[] = [];
  for (const entry of envEntries(content)) {
    if (entry.key !== null && remaining.has(entry.key)) {
      out.push(`${entry.exported ? 'export ' : ''}${entry.key}=${remaining.get(entry.key)}`);
      remaining.delete(entry.key);
      written.add(entry.key);
    } else if (entry.key === null || !written.has(entry.key)) {
      out.push(...entry.lines);
    }
  }
  let text = out.join('\n');
  for (const [key, value] of remaining) text += `\n${key}=${value}`;
  return text.trim() + '\n';
}

/**
 * Drop every definition of `keys`. Comments and other entries pass through,
 * and content without those keys comes back unchanged.
 */
export function removeEnvKeys(content: string, keys: readonly string[]): string {
  const keySet = new Set(keys);
  const entries = envEntries(content);
  const kept = entries.filter((entry) => entry.key === null || !keySet.has(entry.key));
  return kept.length === entries.length ? content : kept.flatMap((entry) => entry.lines).join('\n');
}

/**
 * The provision request provision_database is still waiting on, recorded when
 * it stops waiting so the next call resumes that ticket. It's resumed only
 * for the same database name, backend and account. Absent whenever no request
 * is pending.
 */
export const PENDING_PROVISION_KEYS = {
  ticketId: 'PROVISION_TICKET_ID',
  databaseName: 'PROVISION_TICKET_DATABASE_NAME',
  apiEndpoint: 'PROVISION_TICKET_API_ENDPOINT',
  userId: 'PROVISION_TICKET_USER_ID',
  attempts: 'PROVISION_TICKET_ATTEMPTS',
} as const;

/** The credential keys provision_database owns in a project's .env. */
export const PROVISION_ENV_KEYS = [
  'DATABASE_ID',
  'DATABASE_NAME',
  'OWNER_ID',
  'ACCESS_TOKEN',
  'PGDATABASE',
  'API_ENDPOINT',
  'MODULES_ENDPOINT',
] as const;

/**
 * Keys archived as comments on reprovision — the binding identity: which
 * database, under whom, on which backend. ACCESS_TOKEN is the account login
 * token, identical across bindings, so it is overwritten in place rather than
 * archived.
 */
export const ARCHIVED_BINDING_KEYS = [
  'DATABASE_ID',
  'DATABASE_NAME',
  'OWNER_ID',
  'PGDATABASE',
  'API_ENDPOINT',
  'MODULES_ENDPOINT',
] as const;

/**
 * Build the provisioning credential block written to a project's .env. The
 * endpoint pins record which backend owns this binding — outside-app consumers
 * (verify-feature.sh, skill scripts, dev-server shells) resolve them instead of
 * falling back to localhost defaults when the app targets a hosted backend.
 */
export function provisionEnvVars(args: {
  databaseId: string;
  databaseName: string;
  ownerId: string;
  accessToken: string;
  apiEndpoint: string;
  modulesEndpoint: string;
}): EnvVars {
  return {
    DATABASE_ID: args.databaseId,
    DATABASE_NAME: args.databaseName,
    OWNER_ID: args.ownerId,
    ACCESS_TOKEN: args.accessToken,
    PGDATABASE: args.databaseName,
    API_ENDPOINT: args.apiEndpoint,
    MODULES_ENDPOINT: args.modulesEndpoint,
  };
}

/**
 * Comment out the given keys in place (`# archived <date>: KEY=value`) so a
 * reprovision keeps the previous binding readable in the file instead of
 * silently overwriting it. Every other line — including existing comments and
 * already-archived entries — passes through untouched.
 */
export function archiveBindingKeys(
  content: string,
  keys: readonly string[],
  archivedOn: string,
): string {
  const keySet = new Set(keys);
  return envEntries(content)
    .flatMap((entry) =>
      entry.key !== null && keySet.has(entry.key)
        ? entry.lines.map((line) => `# archived ${archivedOn}: ${line.trim()}`)
        : entry.lines,
    )
    .join('\n');
}
