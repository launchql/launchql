import { ClientBase, Pool, PoolClient, QueryResult } from 'pg';

function setContext(ctx: Record<string, string>): string[] {
  return Object.keys(ctx || {}).reduce<string[]>((m, el) => {
    m.push(`SELECT set_config('${el}', '${ctx[el]}', true);`);
    return m;
  }, []);
}

async function execContext(client: ClientBase, ctx: Record<string, string>): Promise<void> {
  const local = setContext(ctx);
  for (const query of local) {
    await client.query(query);
  }
}

interface ExecOptions {
  client: Pool | ClientBase;
  context?: Record<string, string>;
  query: string;
  variables?: any[];
}

export default async ({ client, context = {}, query = '', variables = [] }: ExecOptions): Promise<QueryResult> => {
  const isPool = 'connect' in client;
  const shouldRelease = isPool;
  let pgClient: ClientBase | PoolClient | null = null;

  try {
    pgClient = isPool ? await (client as Pool).connect() : client as ClientBase;

    await pgClient.query('BEGIN');
    await execContext(pgClient, context);
    const result = await pgClient.query(query, variables);
    await pgClient.query('COMMIT');

    return result;
  } catch (error) {
    if (pgClient) {
      await pgClient.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    if (shouldRelease && pgClient && 'release' in pgClient) {
      pgClient.release();
    }
  }
};
