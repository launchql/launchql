import { DocumentNode,ExecutionResult, graphql, print } from 'graphql';
// @ts-ignore
import MockReq from 'mock-req';
import type { Client, Pool } from 'pg';
import { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { PostGraphileOptions, withPostGraphileContext } from 'postgraphile';

import { GetConnectionsInput } from './types';

interface PgSettings {
    [key: string]: string;
}

type WithContextOptions = PostGraphileOptions & {
  pgPool: Pool;
  pgSettings?: PgSettings;
  req?: MockReq;
  res?: unknown;
};

export const runGraphQLInContext = async <T = ExecutionResult>({
  input,
  conn,
  pgPool,
  schema,
  options,
  authRole,
  query,
  variables,
  reqOptions = {}
}: {
    input: GetConnectionsInput & GetConnectionOpts,
    conn: GetConnectionResult;
    pgPool: Pool;
    schema: any;
    options: PostGraphileOptions;
    authRole: string;
    query: string | DocumentNode;
    variables?: Record<string, any>;
    reqOptions?: Record<string, any>;
}): Promise<T> => {
  if (!conn.pg.client) {
    throw new Error('pgClient is required and must be provided externally.');
  }

  const { res: reqRes, ...restReqOptions } = reqOptions ?? {};

  const req = new MockReq({
    url: options.graphqlRoute || '/graphql',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...restReqOptions
  });
  const res = reqRes ?? {};

  const pgSettingsGenerator = options.pgSettings;
  // @ts-ignore
  const pgSettings: PgSettings =
        typeof pgSettingsGenerator === 'function'
          ? await pgSettingsGenerator(req)
          : pgSettingsGenerator || {};

  const contextOptions: WithContextOptions = { ...options, pgPool, pgSettings, req, res };

  // @ts-ignore
  return await withPostGraphileContext(
    contextOptions,
    async context => {

      const pgConn = input.useRoot ? conn.pg : conn.db;
      const pgClient = pgConn.client;
      // IS THIS BAD TO HAVE ROLE HERE 
      await setContextOnClient(pgClient, pgSettings, authRole);
      await pgConn.ctxQuery();

      const additionalContext = typeof options.additionalGraphQLContextFromRequest === 'function'
        ? await options.additionalGraphQLContextFromRequest(req, res)
        : {};

      const printed = typeof query === 'string' ? query : print(query);
      const result = await graphql({
        schema,
        source: printed,
        contextValue: { ...context, ...additionalContext, pgClient },
        variableValues: variables ?? null
      });
      return result as T;
    }
  );
};

// IS THIS BAD TO HAVE ROLE HERE 
export async function setContextOnClient(
  pgClient: Client,
  pgSettings: Record<string, string>,
  role: string
): Promise<void> {
  await pgClient.query(`select set_config('role', $1, true)`, [role]);

  for (const [key, value] of Object.entries(pgSettings)) {
    await pgClient.query(`select set_config($1, $2, true)`, [key, String(value)]);
  }
}
