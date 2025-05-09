import {
  withPostGraphileContext,
  createPostGraphileSchema
} from 'postgraphile';
import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

export const getSchema = async (pool, settings) =>
  await createPostGraphileSchema(pool, settings.schema, settings);

export class GraphileQuery {
  constructor({ schema, pool, settings }) {
    if (!schema) throw new Error('requires a schema');
    if (!pool) throw new Error('requires a pool');
    if (!settings) throw new Error('requires graphile settings');

    this.pool = pool;
    this.schema = schema;
    this.settings = settings;
  }
  // role is optional! it overrides anything from req passed in.
  async query({ req = {}, query, variables, role }) {
    const queryString = typeof query === 'string' ? query : print(query);
    const { pgSettings: pgSettingsGenerator } = this.settings;
    const pgSettings = role
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
      async (context) => {
        return await graphql(
          this.schema,
          queryString,
          null,
          { ...context },
          variables
        );
      }
    );
  }
}

export class GraphileQuerySimple {
  constructor({ schema, pool }) {
    if (!schema) throw new Error('requires a schema');
    if (!pool) throw new Error('requires a pool');
    this.pool = pool;
    this.schema = schema;
  }
  async query(query, variables) {
    const queryString = typeof query === 'string' ? query : print(query);
    return await withPostGraphileContext(
      {
        pgPool: this.pool
      },
      async (context) => {
        return await graphql(
          this.schema,
          queryString,
          null,
          { ...context },
          variables
        );
      }
    );
  }
}
