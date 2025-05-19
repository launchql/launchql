import { getGraphileSettings } from '@launchql/graphile-settings';
import pg, { Pool, PoolClient } from 'pg';
import {
  createPostGraphileSchema,
  withPostGraphileContext,
  PostGraphileOptions
} from 'postgraphile';
import { graphql, GraphQLSchema, DocumentNode } from 'graphql';
// @ts-ignore
import MockReq from 'mock-req';
import { print } from 'graphql/language/printer';
import { getEnvOptions } from '@launchql/types';

const opt = getEnvOptions();

export interface GraphQLTestOptions {
  dbname: string;
  schemas: string[];
  authRole?: string;
}

type PgSettings = Record<string, string>;

type QueryFunction = (
  query: string | DocumentNode,
  variables?: Record<string, any>
) => Promise<any>;

type CheckerFunction = (query: QueryFunction, client: PoolClient) => Promise<any>;

export const GraphQLTest = ({ dbname, schemas, authRole = 'authenticated' }: GraphQLTestOptions) => {
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
    try {
      if (!ctx) return;
      const { rootPgPool } = ctx;
      ctx = null;
      await rootPgPool.end();
    } catch (e) {
      console.error(e);
    }
  };

  const graphQL = async (...args: any[]): Promise<any> => {
    if (!ctx) throw new Error('Context is not initialized. Did you run setup()?');

    let reqOptions: Record<string, any> = {};
    let checker: CheckerFunction;

    if (args.length === 1) {
      checker = args[0];
    } else if (args.length === 2) {
      reqOptions = args[0];
      checker = args[1];
    } else {
      throw new Error('Invalid arguments supplied to graphQL');
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

    return await withPostGraphileContext(
      { ...options, pgPool: rootPgPool, pgSettings },
      async (context) => {
        const replacementPgClient = await rootPgPool.connect();
        await replacementPgClient.query('begin');
        await replacementPgClient.query("select set_config('role', $1, true)", [POSTGRAPHILE_AUTHENTICATOR_ROLE]);

        for (const [key, value] of Object.entries(pgSettings)) {
          await replacementPgClient.query("select set_config($1, $2, true)", [key, String(value)]);
        }

        try {
          const query: QueryFunction = async (q, variables) => {
            if (typeof q !== 'string') q = print(q);
            return await graphql(schema, q, null, { ...context, pgClient: replacementPgClient }, variables);
          };
          return await checker(query, replacementPgClient);
        } finally {
          await replacementPgClient.query('rollback');
          replacementPgClient.release();
        }
      }
    );
  };

// Overload signatures
async function graphQLQuery(Query: string | DocumentNode): Promise<any>;
async function graphQLQuery(Query: string | DocumentNode, commit: boolean): Promise<any>;
async function graphQLQuery(Query: string | DocumentNode, vars: Record<string, any>): Promise<any>;
async function graphQLQuery(Query: string | DocumentNode, vars: Record<string, any>, commit: boolean): Promise<any>;
async function graphQLQuery(reqOptions: Record<string, any>, Query: string | DocumentNode, vars: Record<string, any>): Promise<any>;
async function graphQLQuery(reqOptions: Record<string, any>, Query: string | DocumentNode, vars: Record<string, any>, commit: boolean): Promise<any>;
async function graphQLQuery(...args: any[]): Promise<any> {
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

    return await withPostGraphileContext(
      { ...options, pgPool: rootPgPool, pgSettings },
      async (context) => {
        const replacementPgClient = await rootPgPool.connect();
        await replacementPgClient.query('begin');
        await replacementPgClient.query("select set_config('role', $1, true)", [POSTGRAPHILE_AUTHENTICATOR_ROLE]);

        for (const [key, value] of Object.entries(pgSettings)) {
          await replacementPgClient.query("select set_config($1, $2, true)", [key, String(value)]);
        }

        try {
          if (typeof Query !== 'string') Query = print(Query);
          return await graphql(schema, Query, null, { ...context, pgClient: replacementPgClient }, vars);
        } finally {
          await replacementPgClient.query(commit ? 'commit' : 'rollback');
          replacementPgClient.release();
        }
      }
    );
  };

  return {
    setup,
    teardown,
    graphQL,
    graphQLQuery,
    // @ts-ignore
    withContext: <T>(cb: (ctx: typeof ctx) => T): T => cb(ctx)
  };
};
