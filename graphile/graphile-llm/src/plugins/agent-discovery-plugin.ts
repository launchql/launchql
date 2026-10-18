/**
 * Agent Discovery
 *
 * Discovers agent tables by querying the agent_chat_module config table
 * at runtime. The module stores schema_id, table names, and table IDs
 * when provisioned — no smart tags needed.
 *
 * Results are cached per-database with a TTL so the REST middleware
 * doesn't hit the database on every request.
 *
 * Discovery is keyed by `database_id`, as every other module lookup is: one
 * serving database holds several tenants' schemas, so an unkeyed lookup does
 * not fail — it resolves a neighbouring tenant's agent tables, and the cache
 * then serves that for its whole TTL.
 */

import { ModuleConfigCache } from 'graphile-cache';
import { Pool } from 'pg';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentTableInfo {
  /** The PostgreSQL schema name (e.g. 'agent_public') */
  schemaName: string;
  /** The table name (e.g. 'agent_thread') */
  tableName: string;
}

export interface AgentDiscovery {
  thread: AgentTableInfo | null;
  message: AgentTableInfo | null;
  task: AgentTableInfo | null;
}

// ─── Cache ──────────────────────────────────────────────────────────────────

let agentDiscoveryCaches = new WeakMap<
  object,
  ModuleConfigCache<AgentDiscovery | null>
>();

function cacheForPool(pool: object): ModuleConfigCache<AgentDiscovery | null> {
  let cache = agentDiscoveryCaches.get(pool);
  if (!cache) {
    cache = new ModuleConfigCache<AgentDiscovery | null>({
      name: 'agent-discovery',
      ttlMs: 60_000
    });
    agentDiscoveryCaches.set(pool, cache);
  }
  return cache;
}

/** Clear all cached discovery results (for testing) */
export function clearAgentDiscoveryCache(): void {
  agentDiscoveryCaches = new WeakMap();
}

// ─── Discovery Query ────────────────────────────────────────────────────────

const DISCOVERY_SQL = `
  SELECT
    s.schema_name,
    acm.thread_table_name,
    acm.message_table_name,
    acm.task_table_name
  FROM metaschema_modules_public.agent_chat_module acm
  JOIN metaschema_public.schema s ON s.id = acm.schema_id
  WHERE acm.database_id = $1
  LIMIT 1
`;

/** The module (or the whole metaschema) is simply absent from this database. */
const NOT_PROVISIONED = new Set([
  '42P01', // undefined_table
  '3F000' // invalid_schema_name
]);

const isNotProvisioned = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  typeof err.code === 'string' &&
  NOT_PROVISIONED.has(err.code);

/**
 * Look up agent table info for a database, querying the module config table.
 * Results are cached per database id with a 60s TTL.
 */
export async function getAgentDiscovery(
  pool: Pool,
  databaseId: string
): Promise<AgentDiscovery | null> {
  if (!databaseId) {
    throw new Error('getAgentDiscovery: databaseId is required');
  }

  const agentDiscoveryCache = cacheForPool(pool);
  const cached = agentDiscoveryCache.get(databaseId);
  if (cached !== undefined) {
    return cached;
  }

  let discovery: AgentDiscovery | null = null;

  try {
    const { rows } = await pool.query(DISCOVERY_SQL, [databaseId]);

    if (rows.length > 0) {
      const row = rows[0];
      const schemaName: string = row.schema_name;

      discovery = {
        thread: row.thread_table_name
          ? { schemaName, tableName: row.thread_table_name }
          : null,
        message: row.message_table_name
          ? { schemaName, tableName: row.message_table_name }
          : null,
        task: row.task_table_name
          ? { schemaName, tableName: row.task_table_name }
          : null
      };
    }
  } catch (err) {
    // Only the absence being probed for is swallowed. A dead pool or a bad
    // databaseId reported as "not provisioned" is a silently agent-less API.
    if (!isNotProvisioned(err)) throw err;
  }

  agentDiscoveryCache.set(databaseId, discovery);
  return discovery;
}
