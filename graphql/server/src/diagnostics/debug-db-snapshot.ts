import type { ConstructiveOptions } from '@constructive-io/graphql-types';
import { Pool, type PoolClient } from 'pg';
import { buildConnectionString, getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

const ACTIVE_ACTIVITY_SQL = `
  select
    pid,
    usename,
    application_name,
    state,
    wait_event_type,
    wait_event,
    age(now(), xact_start) as xact_age,
    age(now(), query_start) as query_age,
    left(query, 500) as query
  from pg_stat_activity
  where datname = current_database()
    and pid <> pg_backend_pid()
    and (
      xact_start is not null
      or wait_event_type is not null
      or state <> 'idle'
    )
  order by xact_start asc nulls last, query_start asc nulls last
  limit 50
`;

const BLOCKED_ACTIVITY_SQL = `
  with blocked as (
    select
      a.pid as blocked_pid,
      a.usename as blocked_user,
      a.application_name as blocked_application,
      a.state as blocked_state,
      a.wait_event_type,
      a.wait_event,
      age(now(), a.query_start) as blocked_for,
      left(a.query, 500) as blocked_query,
      pg_blocking_pids(a.pid) as blocker_pids
    from pg_stat_activity a
    where a.datname = current_database()
      and cardinality(pg_blocking_pids(a.pid)) > 0
  )
  select
    b.blocked_pid,
    b.blocked_user,
    b.blocked_application,
    b.blocked_state,
    b.wait_event_type,
    b.wait_event,
    b.blocked_for,
    b.blocked_query,
    blocker.pid as blocker_pid,
    blocker.usename as blocker_user,
    blocker.application_name as blocker_application,
    blocker.state as blocker_state,
    left(blocker.query, 500) as blocker_query
  from blocked b
  left join lateral unnest(b.blocker_pids) blocker_pid on true
  left join pg_stat_activity blocker on blocker.pid = blocker_pid
  order by b.blocked_for desc
`;

const LOCK_SUMMARY_SQL = `
  select
    locktype,
    mode,
    granted,
    count(*)::int as count
  from pg_locks
  group by locktype, mode, granted
  order by granted asc, count desc, locktype asc, mode asc
`;

const DATABASE_STATS_SQL = `
  select
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted,
    temp_files,
    temp_bytes,
    deadlocks,
    checksum_failures,
    stats_reset
  from pg_stat_database
  where datname = current_database()
`;

const SETTINGS_SQL = `
  select
    name,
    setting,
    unit
  from pg_settings
  where name = any(array[
    'max_connections',
    'shared_buffers',
    'work_mem',
    'maintenance_work_mem',
    'effective_cache_size',
    'statement_timeout',
    'lock_timeout',
    'idle_in_transaction_session_timeout'
  ])
  order by name asc
`;

const NOTIFY_QUEUE_SQL = `
  select pg_notification_queue_usage() as queue_usage
`;

const DIAGNOSTICS_STATEMENT_TIMEOUT_MS = 3_000;
const DIAGNOSTICS_LOCK_TIMEOUT_MS = 500;
const diagnosticsPools = new Map<string, Pool>();

const buildDiagnosticsConnectionString = (opts: ConstructiveOptions): string => {
  const pgConfig = getPgEnvOptions(opts.pg);
  return buildConnectionString(
    pgConfig.user,
    pgConfig.password,
    pgConfig.host,
    pgConfig.port,
    pgConfig.database,
  );
};

const getDiagnosticsPool = (opts: ConstructiveOptions): Pool => {
  const connectionString = buildDiagnosticsConnectionString(opts);
  const existing = diagnosticsPools.get(connectionString);
  if (existing) {
    return existing;
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 1_500,
    allowExitOnIdle: true,
    application_name: 'constructive-debug-snapshot',
  });
  diagnosticsPools.set(connectionString, pool);
  return pool;
};

const withDiagnosticsClient = async <T>(
  opts: ConstructiveOptions,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const diagnosticsPool = getDiagnosticsPool(opts);
  const client = await diagnosticsPool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = '${DIAGNOSTICS_STATEMENT_TIMEOUT_MS}ms'`);
    await client.query(`SET LOCAL lock_timeout = '${DIAGNOSTICS_LOCK_TIMEOUT_MS}ms'`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Best-effort rollback for diagnostics-only transactions.
    }
    throw error;
  } finally {
    client.release();
  }
};

export const closeDebugDatabasePools = async (): Promise<void> => {
  const pools = [...diagnosticsPools.values()];
  diagnosticsPools.clear();
  await Promise.allSettled(pools.map((pool) => pool.end()));
};

export interface DebugDatabaseSnapshot {
  database: string | null | undefined;
  pool: {
    max: number | null;
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
  activeActivity: unknown[];
  blockedActivity: unknown[];
  lockSummary: unknown[];
  databaseStats: Record<string, unknown> | null;
  settings: unknown[];
  notificationQueueUsage: number | null;
  timestamp: string;
}

export const getDebugDatabaseSnapshot = async (
  opts: ConstructiveOptions,
): Promise<DebugDatabaseSnapshot> => {
  const appPool = getPgPool(opts.pg);
  const {
    activity,
    blocked,
    lockSummary,
    databaseStats,
    settings,
    notifyQueue,
  } = await withDiagnosticsClient(opts, async (client) => ({
    activity: await client.query(ACTIVE_ACTIVITY_SQL),
    blocked: await client.query(BLOCKED_ACTIVITY_SQL),
    lockSummary: await client.query(LOCK_SUMMARY_SQL),
    databaseStats: await client.query(DATABASE_STATS_SQL),
    settings: await client.query(SETTINGS_SQL),
    notifyQueue: await client.query(NOTIFY_QUEUE_SQL),
  }));

  return {
    database: opts.pg?.database ?? null,
    pool: {
      max: (appPool as { options?: { max?: number } }).options?.max ?? null,
      totalCount: appPool.totalCount,
      idleCount: appPool.idleCount,
      waitingCount: appPool.waitingCount,
    },
    activeActivity: activity.rows,
    blockedActivity: blocked.rows,
    lockSummary: lockSummary.rows,
    databaseStats: databaseStats.rows[0] ?? null,
    settings: settings.rows,
    notificationQueueUsage: (notifyQueue.rows[0]?.queue_usage as number | null | undefined) ?? null,
    timestamp: new Date().toISOString(),
  };
};
