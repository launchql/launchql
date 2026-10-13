import { pgpmDefaults, PgpmOptions } from '@pgpmjs/types';
import { getStrictEnvMode, isProduction } from '12factor-env';

/**
 * Production-safety enforcement for the merged PGPM options.
 *
 * `pgpmDefaults` bakes in development-only values so local dev and tests work
 * out of the box (e.g. `pg.password = 'password'`, `pg.host = 'localhost'`). Those are a liability in production:
 * a deploy that forgets to set the real value boots on the dev default instead
 * of failing. `deepmerge` cannot express "dev default, required in prod", so
 * this is enforced here as an opt-in assertion callers run at startup.
 *
 * A value is flagged only when it is *still identical to the built-in default*
 * (i.e. neither config file, env var, nor override replaced it) AND we are in
 * production. Enforcement is gated by `STRICT_ENV` (see `12factor-env`): `warn`
 * by default (log loudly, keep booting) and `throw` once the fleet is clean.
 *
 * `getEnvOptions` calls this on every invocation, so warnings are de-duplicated
 * per-process (by message) to avoid log spam; `throw` always throws.
 */

type Severity = 'secret' | 'host';

interface SensitiveField {
  /** Dot path into the merged `PgpmOptions`. */
  path: string;
  severity: Severity;
  /** Env var(s) an operator should set to provide a real value. */
  envHint: string;
}

const SENSITIVE_FIELDS: SensitiveField[] = [
  { path: 'pg.password', severity: 'secret', envHint: 'PGPASSWORD' },
  { path: 'db.connections.app.password', severity: 'secret', envHint: 'DB_CONNECTIONS_APP_PASSWORD' },
  { path: 'db.connections.admin.password', severity: 'secret', envHint: 'DB_CONNECTIONS_ADMIN_PASSWORD' },
  { path: 'pg.host', severity: 'host', envHint: 'PGHOST' },
  { path: 'pg.database', severity: 'host', envHint: 'PGDATABASE' },
  { path: 'db.rootDb', severity: 'host', envHint: 'PGROOTDATABASE' },
  { path: 'server.host', severity: 'host', envHint: 'SERVER_HOST' }
];

const getPath = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>(
    (acc, key) =>
      acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
    obj
  );

/**
 * Return a human-readable description of every sensitive option that is still
 * the built-in development default. Never includes the value itself (secrets
 * must not be logged) — only the option path and the env var to set.
 */
export const findUnsafeProductionDefaults = (opts: PgpmOptions): string[] => {
  const issues: string[] = [];
  for (const field of SENSITIVE_FIELDS) {
    const value = getPath(opts, field.path);
    const builtInDefault = getPath(pgpmDefaults, field.path);
    if (value !== undefined && value === builtInDefault) {
      const note =
        field.severity === 'secret'
          ? ' (a secret; must be provided in production)'
          : '';
      issues.push(`${field.path} is still the built-in dev default${note} — set ${field.envHint}`);
    }
  }
  return issues;
};

const warnedMessages = new Set<string>();

/**
 * Assert that the merged PGPM options are safe for production. No-op outside
 * production (per `12factor-env`'s house `NODE_ENV` semantics, so tests and CI
 * are unaffected). In production, warns or throws per `STRICT_ENV`.
 */
export const assertProductionEnvOptions = (
  opts: PgpmOptions,
  env: NodeJS.ProcessEnv = process.env
): void => {
  if (!isProduction(env)) return;

  const issues = findUnsafeProductionDefaults(opts);
  if (issues.length === 0) return;

  const message =
    'Unsafe production environment — the following values are still the built-in ' +
    `development defaults:\n  ${issues.join('\n  ')}`;

  if (getStrictEnvMode(env) === 'throw') {
    throw new Error(message);
  }

  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[pgpm-env] ${message}\n(set STRICT_ENV=throw to make this fatal)`);
};
