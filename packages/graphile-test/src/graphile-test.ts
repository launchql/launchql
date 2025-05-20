import type { GraphQLSchema } from 'graphql';
import type { GraphQLTestContext } from './types';

import { runGraphQLInContext } from './context';
import { GraphQLQueryOptions } from './types';
import { createPostGraphileSchema, PostGraphileOptions } from 'postgraphile';
import { getGraphileSettings } from 'graphile-settings';
import { GetConnectionsInput } from './connect';
import { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';

export const GraphQLTest = (
  input: GetConnectionsInput & GetConnectionOpts,
  conn: GetConnectionResult
): GraphQLTestContext => {

  const {
    schemas,
    authRole
  } = input;

  let schema: GraphQLSchema;
  let options: PostGraphileOptions;

  const pgPool = conn.manager.getPool(conn.pg.config);
  const setup = async () => {
    options = getGraphileSettings({ graphile: { schema: schemas } });
    schema = await createPostGraphileSchema(
      pgPool,
      schemas,
      options
    );
  };

  const teardown = async () => { };

  const query = async <T = any>(opts: GraphQLQueryOptions): Promise<T> => {
    return await runGraphQLInContext<T>({
      input,
      schema,
      options,
      authRole,
      pgPool,
      conn,
      ...opts
    });
  };

  return {
    setup,
    teardown,
    query
  };
};
