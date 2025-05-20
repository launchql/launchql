import { graphql, print, ExecutionResult, DocumentNode } from 'graphql';
import { withPostGraphileContext, PostGraphileOptions } from 'postgraphile';
// @ts-ignore
import MockReq from 'mock-req';
import type { Client, Pool } from 'pg';
import { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { GetConnectionsInput } from './connect';

interface PgSettings {
    [key: string]: string;
}

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

    const req = new MockReq({
        url: options.graphqlRoute || '/graphql',
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        ...reqOptions
    });

    const pgSettingsGenerator = options.pgSettings;
    // @ts-ignore
    const pgSettings: PgSettings =
        typeof pgSettingsGenerator === 'function'
            ? await pgSettingsGenerator(req)
            : pgSettingsGenerator || {};

    // @ts-ignore
    return await withPostGraphileContext(   
        { ...options, pgPool, pgSettings },
        async context => {

            const pgConn = input.useRoot ? conn.pg : conn.db;
            const pgClient = pgConn.client;
            await setContextOnClient(pgClient, pgSettings, authRole);
            await pgConn.ctxQuery();

            const printed = typeof query === 'string' ? query : print(query);
            const result = await graphql({
                schema,
                source: printed,
                contextValue: { ...context, pgClient },
                variableValues: variables ?? null
            });
            return result as T;
        }
    );
};


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
