import { getGraphileSettings } from '@launchql/graphile-settings';
import pg, { Pool, PoolClient } from 'pg';
import {
  createPostGraphileSchema,
  withPostGraphileContext,
  PostGraphileOptions
} from 'postgraphile';
import { graphql, GraphQLSchema, DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';
// @ts-ignore
import MockReq from 'mock-req';
import { getEnvOptions } from '@launchql/types';
import { GraphQLTestContext } from './connect';

const opt = getEnvOptions();

export interface GraphQLTestOptions {
  dbname: string;
  schemas: string[];
  authRole?: string;
}

type PgSettings = Record<string, string>;

type QueryFunction<T = unknown> = (
  query: string | DocumentNode,
  variables?: Record<string, unknown>
) => Promise<T>;

type CheckerFunction<T = unknown> = (
  query: QueryFunction<T>,
  client: PoolClient
) => Promise<T>;

export const GraphQLTest = ({ dbname, schemas, authRole = 'authenticated' }: GraphQLTestOptions): GraphQLTestContext => {
  const getDbString = (db: string): string =>
    `postgres://${opt.pg.user}:${opt.pg.password}@${opt.pg.host}:${opt.pg.port}/${db}`;

  const options: PostGraphileOptions = {
    ...getGraphileSettings({
      graphile: {
        schema: schemas
      }
    }),
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql'
  };

  pg.defaults.poolSize = 1;

  const POSTGRAPHILE_AUTHENTICATOR_ROLE = authRole;

  let ctx: {
    rootPgPool: Pool;
    options: PostGraphileOptions;
    schema: GraphQLSchema;
  } | null = null;

  const setup = async () => {
    const rootPgPool = new pg.Pool({
      connectionString: getDbString(dbname)
    });

    const schema = await createPostGraphileSchema(rootPgPool, schemas, options);
    ctx = { rootPgPool, options, schema };
  };

  const teardown = async () => {
    if (!ctx) return;
    try {
      const { rootPgPool } = ctx;
      ctx = null;
      await rootPgPool.end();
    } catch (e) {
      console.error(e);
    }
  };

  const graphQL = async <T>(fn: (query: QueryFunction<T>) => Promise<T>): Promise<T> => {
    if (!ctx) throw new Error('Context is not initialized. Did you run setup()?');
  
    const { schema, rootPgPool, options } = ctx;
  
    const req = new MockReq({
      url: options.graphqlRoute || '/graphql',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
  
    const pgSettingsGenerator = options.pgSettings;
    // @ts-ignore
    const pgSettings: PgSettings =
      typeof pgSettingsGenerator === 'function' ? await pgSettingsGenerator(req) : pgSettingsGenerator || {};
  

    // @ts-ignore
    return await withPostGraphileContext(
      { ...options, pgPool: rootPgPool, pgSettings },
      async (context) => {
        const pgClient = await rootPgPool.connect();
        await pgClient.query('begin');
        await pgClient.query("select set_config('role', $1, true)", [POSTGRAPHILE_AUTHENTICATOR_ROLE]);
  
        for (const [key, value] of Object.entries(pgSettings)) {
          await pgClient.query("select set_config($1, $2, true)", [key, String(value)]);
        }
  
        try {
          const query: QueryFunction<T> = async (q, variables) => {
            const printed = typeof q === 'string' ? q : print(q);
            const result = await graphql(
              schema,
              printed,
              null,
              { ...context, pgClient },
              variables
            );
            return result as T;
          };
  
          return await fn(query);
        } finally {
          await pgClient.query('rollback');
          pgClient.release();
        }
      }
    );
  };
  

  // === Overloads for graphQLQuery ===
  async function graphQLQuery<T = any>(query: string | DocumentNode): Promise<T>;
  async function graphQLQuery<T = any>(query: string | DocumentNode, commit: boolean): Promise<T>;
  async function graphQLQuery<T = any>(query: string | DocumentNode, vars: Record<string, any>): Promise<T>;
  async function graphQLQuery<T = any>(
    query: string | DocumentNode,
    vars: Record<string, any>,
    commit: boolean
  ): Promise<T>;
  async function graphQLQuery<T = any>(
    reqOptions: Record<string, any>,
    query: string | DocumentNode,
    vars: Record<string, any>
  ): Promise<T>;
  async function graphQLQuery<T = any>(
    reqOptions: Record<string, any>,
    query: string | DocumentNode,
    vars: Record<string, any>,
    commit: boolean
  ): Promise<T>;
  async function graphQLQuery<T = any>(...args: any[]): Promise<T> {
    if (!ctx) throw new Error('Context is not initialized. Did you run setup()?');

    let reqOptions: Record<string, any> = {};
    let Query: string | DocumentNode;
    let vars: Record<string, any> | undefined;
    let commit = false;

    if (args.length === 1) {
      Query = args[0];
    } else if (args.length === 2) {
      if (typeof args[1] === 'boolean') {
        Query = args[0];
        commit = args[1];
      } else {
        Query = args[0];
        vars = args[1];
      }
    } else if (args.length === 3) {
      if (typeof args[2] === 'boolean') {
        Query = args[0];
        vars = args[1];
        commit = args[2];
      } else {
        reqOptions = args[0];
        Query = args[1];
        vars = args[2];
      }
    } else if (args.length === 4) {
      reqOptions = args[0];
      Query = args[1];
      vars = args[2];
      commit = args[3];
    } else {
      throw new Error('Invalid arguments supplied to graphQLQuery');
    }

    const { schema, rootPgPool, options } = ctx;
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
      typeof pgSettingsGenerator === 'function' ? await pgSettingsGenerator(req) : pgSettingsGenerator || {};

    // @ts-ignore
    return await withPostGraphileContext(
      { ...options, pgPool: rootPgPool, pgSettings },
      async (context) => {
        const pgClient = await rootPgPool.connect();
        await pgClient.query('begin');
        await pgClient.query("select set_config('role', $1, true)", [POSTGRAPHILE_AUTHENTICATOR_ROLE]);

        for (const [key, value] of Object.entries(pgSettings)) {
          await pgClient.query("select set_config($1, $2, true)", [key, String(value)]);
        }

        try {
          const queryString = typeof Query === 'string' ? Query : print(Query);
          const result = await graphql(
            schema,
            queryString,
            null,
            { ...context, pgClient },
            vars
          );
          return result as T;
        } finally {
          await pgClient.query(commit ? 'commit' : 'rollback');
          pgClient.release();
        }
      }
    );
  }

  return {
    setup,
    teardown,
    // @ts-ignore
    graphQL,
    graphQLQuery,
    // @ts-ignore
    withContext: <T>(cb: (ctx: typeof ctx) => T): T => cb(ctx)
  };
};
