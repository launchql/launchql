/**
 * Database Standing Loader
 *
 * Whether a database may be served right now. The state is the two
 * system-controlled columns on `metaschema_public.database`
 * (`suspended_at`, `suspended_reason`) that billing and platform admins write;
 * every lane reads it through this loader so the policy behind "suspended" can
 * change without touching a serving path.
 *
 * The TTL is deliberately short: it bounds how long an established client
 * keeps being served after its database is suspended.
 *
 * Any read failure propagates so the caller fails closed. A database the plane does not
 * know is *not* servable — a request pinned to it has nothing to run against.
 */

import type { DatabaseStanding } from '../types';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

// The serving login is NOBYPASSRLS and the database table's RLS shows a row
// only to members of the owning org, so the login reads standing through the
// platform's login-only reader rather than the table.
export const DATABASE_STANDING_SQL = `
  SELECT suspended_at, suspended_reason
  FROM function_resolution.database_standing($1)
`;

export const DATABASE_STANDING_TTL_MS = 5_000;

// ─── Row Types ──────────────────────────────────────────────────────────────

interface DatabaseStandingRow {
  suspended_at: Date | string | null;
  suspended_reason: string | null;
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export const standingLoader: ModuleLoader<DatabaseStanding> = createModuleLoader<DatabaseStanding>({
  name: 'standing',
  ttlMs: DATABASE_STANDING_TTL_MS,
  async resolve(ctx: LoaderContext) {
    const { routingPool, databaseId } = ctx;
    const { rows } = await routingPool.query<DatabaseStandingRow>(DATABASE_STANDING_SQL, [databaseId]);
    const row = rows[0];
    if (!row) return { exists: false, suspended: false, suspendedAt: null, reason: null };
    const suspendedAt = row.suspended_at === null ? null : new Date(row.suspended_at);
    return {
      exists: true,
      suspended: suspendedAt !== null,
      suspendedAt,
      reason: row.suspended_reason
    };
  }
});
