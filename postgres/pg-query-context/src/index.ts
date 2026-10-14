import { ClientBase, Pool, PoolClient, QueryResult } from 'pg';

// --- Internal helpers ---

function setContext(ctx: Record<string, string>): { query: string; values: string[] }[] {
  return Object.keys(ctx || {}).reduce<{ query: string; values: string[] }[]>((m, el) => {
    m.push({ query: 'SELECT set_config($1, $2, true)', values: [el, ctx[el]] });
    return m;
  }, []);
}

async function execContext(client: ClientBase, ctx: Record<string, string>): Promise<void> {
  const local = setContext(ctx);
  for (const { query, values } of local) {
    await client.query(query, values);
  }
}

// --- Single-query API (original) ---

export interface ExecOptions {
  client: Pool | ClientBase;
  context?: Record<string, string>;
  query: string;
  variables?: any[];
  skipTransaction?: boolean;
}

async function pgQueryContext({ client, context = {}, query = '', variables = [], skipTransaction = false }: ExecOptions): Promise<QueryResult> {
  const isPool = 'connect' in client;
  const shouldRelease = isPool;
  let pgClient: ClientBase | PoolClient | null = null;

  try {
    pgClient = isPool ? await (client as Pool).connect() : client as ClientBase;

    if (!skipTransaction) {
      await pgClient.query('BEGIN');
    }
    await execContext(pgClient, context);
    const result = await pgClient.query(query, variables);
    if (!skipTransaction) {
      await pgClient.query('COMMIT');
    }

    return result;
  } catch (error) {
    if (pgClient && !skipTransaction) {
      await pgClient.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    if (shouldRelease && pgClient && 'release' in pgClient) {
      pgClient.release();
    }
  }
}

export default pgQueryContext;

// --- Callback-based API ---

export interface WithPgClientOptions {
  skipTransaction?: boolean;
}

/**
 * Execute a callback within a tenant-scoped RLS transaction.
 *
 * Acquires a client from the pool, applies pgSettings via set_config
 * (scoped to the transaction), calls the callback, then commits or
 * rolls back. The client is always released back to the pool.
 *
 * Use this when you need to run multiple queries within the same
 * RLS context (e.g., auth check + data mutation).
 */
export async function withPgClient<T>(
  pool: Pool,
  context: Record<string, string>,
  fn: (client: PoolClient) => Promise<T>,
  opts: WithPgClientOptions = {},
): Promise<T> {
  const client = await pool.connect();
  try {
    if (!opts.skipTransaction) {
      await client.query('BEGIN');
    }
    await execContext(client, context);
    const result = await fn(client);
    if (!opts.skipTransaction) {
      await client.query('COMMIT');
    }
    return result;
  } catch (err) {
    if (!opts.skipTransaction) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw err;
  } finally {
    client.release();
  }
}

// --- Control-plane API ---

export interface ControlPlaneQueryable {
  query<R extends Record<string, any> = any>(text: string, values?: any[]): Promise<QueryResult<R>>;
}

/**
 * A pool whose every query runs as the control role: `BEGIN; SET LOCAL ROLE
 * <role>; <query>; COMMIT`. It deliberately exposes only `query`, so code
 * holding it cannot borrow a raw client that would run as the login role.
 */
export interface ControlPlanePool extends ControlPlaneQueryable {
  readonly role: string;
}

const requireControlRole = (role: string): string => {
  if (typeof role !== 'string' || role.length === 0) {
    throw new Error(
      'Control-plane query refused: no control role is configured (api.controlRole / API_CONTROL_ROLE)'
    );
  }
  return role;
};

/**
 * Run control-plane work inside `BEGIN; SET LOCAL ROLE <role>; … COMMIT`.
 *
 * Login roles are NOINHERIT with no privileges of their own, so every
 * control-plane read or write has to name the role it runs as; a connection
 * that never switched role can do nothing. `context` adds further
 * transaction-local settings (e.g. jwt claims) after the role switch.
 */
export async function withControlRole<T>(
  pool: Pool,
  role: string,
  fn: (client: PoolClient) => Promise<T>,
  context: Record<string, string> = {},
): Promise<T> {
  requireControlRole(role);
  return withPgClient(pool, { ...context, role }, fn);
}

const controlPlanePools = new WeakMap<Pool, Map<string, ControlPlanePool>>();

/** The (cached) control-role view of `pool`. */
export function controlPlanePool(pool: Pool, role: string): ControlPlanePool {
  requireControlRole(role);
  let byRole = controlPlanePools.get(pool);
  if (!byRole) {
    byRole = new Map();
    controlPlanePools.set(pool, byRole);
  }
  let control = byRole.get(role);
  if (!control) {
    control = {
      role,
      query: (text, values) =>
        withControlRole(pool, role, (client) => client.query(text, values))
    };
    byRole.set(role, control);
  }
  return control;
}
