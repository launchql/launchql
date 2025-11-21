import type { GraphQLSchema } from 'graphql';
import { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { createPostGraphileSchema, PostGraphileOptions } from 'postgraphile';

import { runGraphQLInContext } from './context';
import type { GraphQLQueryOptions,GraphQLTestContext } from './types';
import { GetConnectionsInput } from './types';

export const GraphQLTest = (
  input: GetConnectionsInput & GetConnectionOpts,
  conn: GetConnectionResult
): GraphQLTestContext => {
  const {
    schemas,
    authRole,
    graphile
  } = input;

  let schema: GraphQLSchema;
  let options: PostGraphileOptions;

  const pgPool = conn.manager.getPool(conn.pg.config);

  const setup = async () => {
    // Bare-bones configuration - no defaults, only use what's explicitly provided
    // This gives full control over PostGraphile configuration
    options = {
      schema: schemas,
      // Only apply graphile options if explicitly provided
      ...(graphile?.appendPlugins && {
        appendPlugins: graphile.appendPlugins
      }),
      ...(graphile?.graphileBuildOptions && {
        graphileBuildOptions: graphile.graphileBuildOptions
      }),
      // Apply any overrideSettings if provided
      ...(graphile?.overrideSettings || {})
    } as PostGraphileOptions;

    schema = await createPostGraphileSchema(pgPool, schemas, options);
  };

  const teardown = async () => { /* optional cleanup */ };

  const query = async <TResult = any, TVariables = Record<string, any>>(
    opts: GraphQLQueryOptions<TVariables>
  ): Promise<TResult> => {
    return await runGraphQLInContext<TResult>({
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
