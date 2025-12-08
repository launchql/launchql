import { ExecutionResult,graphql, GraphQLSchema } from 'graphql';
import { print } from 'graphql/language/printer';
import { Pool } from 'pg';
import {
  createPostGraphileSchema,
  PostGraphileOptions,
  withPostGraphileContext} from 'postgraphile';

interface GraphileSettings extends PostGraphileOptions {
  schema: string | string[];
}

export const getSchema = async (
  pool: Pool,
  settings: GraphileSettings
): Promise<GraphQLSchema> =>
  await createPostGraphileSchema(pool, settings.schema, settings);

interface GraphileQueryParams {
  schema: GraphQLSchema;
  pool: Pool;
  settings: GraphileSettings;
}

interface QueryOptions {
  req?: any; // can be extended to a specific request type
  query: string;
  variables?: Record<string, any>;
  role?: string;
}

export class GraphileQuery {
  private pool: Pool;
  private schema: GraphQLSchema;
  private settings: GraphileSettings;

  constructor({ schema, pool, settings }: GraphileQueryParams) {
    if (!schema) throw new Error('requires a schema');
    if (!pool) throw new Error('requires a pool');
    if (!settings) throw new Error('requires graphile settings');

    this.pool = pool;
    this.schema = schema;
    this.settings = settings;
  }

  async query({ req = {}, query, variables, role }: QueryOptions): Promise<ExecutionResult> {
    const queryString = typeof query === 'string' ? query : print(query);
    const { pgSettings: pgSettingsGenerator } = this.settings;

    const pgSettings =
      role != null
        ? { role }
        : typeof pgSettingsGenerator === 'function'
          ? await pgSettingsGenerator(req)
          : pgSettingsGenerator;

    return await withPostGraphileContext(
      {
        ...this.settings,
        pgPool: this.pool,
        pgSettings
      },
      async (context: any) => {
        return await graphql({
          schema: this.schema,
          source: queryString,
          contextValue: context,
          variableValues: variables
        });
      }
    );
  }
}

interface GraphileQuerySimpleParams {
  schema: GraphQLSchema;
  pool: Pool;
}

export class GraphileQuerySimple {
  private pool: Pool;
  private schema: GraphQLSchema;

  constructor({ schema, pool }: GraphileQuerySimpleParams) {
    if (!schema) throw new Error('requires a schema');
    if (!pool) throw new Error('requires a pool');
    this.pool = pool;
    this.schema = schema;
  }

  async query(
    query: string,
    variables?: Record<string, any>
  ): Promise<ExecutionResult> {
    const queryString = typeof query === 'string' ? query : print(query);

    return await withPostGraphileContext(
      { pgPool: this.pool },
      async (context: any) => {
        return await graphql({
          schema: this.schema,
          source: queryString,
          contextValue: context,
          variableValues: variables
        });
      }
    );
  }
}
