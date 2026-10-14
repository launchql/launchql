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
