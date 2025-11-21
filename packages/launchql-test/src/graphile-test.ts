import type { GraphQLQueryOptions, GraphQLTestContext, GetConnectionsInput } from 'graphile-test';
import { getGraphileSettings } from 'graphile-settings';
import type { GraphQLSchema } from 'graphql';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { createPostGraphileSchema, PostGraphileOptions } from 'postgraphile';
import { runGraphQLInContext } from 'graphile-test/context';

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

    // Get base settings from graphile-settings
    const baseOptions = getGraphileSettings({ graphile: { schema: schemas } });
    
    // Merge custom graphile options
    options = {
      ...baseOptions,
      // Merge appendPlugins if provided
      ...(graphile?.appendPlugins && {
        appendPlugins: [
          ...(baseOptions.appendPlugins || []),
          ...graphile.appendPlugins
        ]
      }),
      // Merge graphileBuildOptions if provided
      ...(graphile?.graphileBuildOptions && {
        graphileBuildOptions: {
          ...baseOptions.graphileBuildOptions,
          ...graphile.graphileBuildOptions
        }
      }),
      // Apply overrideSettings if provided
      ...(graphile?.overrideSettings || {})
    };

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
