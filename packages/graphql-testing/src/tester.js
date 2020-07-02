import env from './env';
import getSettings from './settings';
import pg from 'pg';
import {
  createPostGraphileSchema,
  withPostGraphileContext
} from 'postgraphile';
import { graphql } from 'graphql';
import MockReq from 'mock-req';
import { print } from 'graphql/language/printer';

export const GraphQLTest = ({ settings }) => {
  const getDbString = (db) =>
    `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

  const options = getSettings(settings);

  pg.defaults.poolSize = 1;

  // This is the role that your normal PostGraphile connection string would use,
  // e.g. `postgres://POSTGRAPHILE_AUTHENTICATOR_ROLE:password@host/db`
  const POSTGRAPHILE_AUTHENTICATOR_ROLE = 'authenticated';

  // Contains the PostGraphile schema and rootPgPool
  let ctx;

  const setup = async () => {
    const rootPgPool = new pg.Pool({
      connectionString: getDbString(settings.dbname)
    });

    const schema = await createPostGraphileSchema(
      rootPgPool,
      options.schema,
      options
    );

    // Store the context
    ctx = {
      rootPgPool,
      options,
      schema
    };
  };

  const teardown = async () => {
    try {
      if (!ctx) {
        return null;
      }
      const { rootPgPool } = ctx;
      ctx = null;
      await rootPgPool.end();
      return null;
    } catch (e) {
      console.error(e); // eslint-disable-line
      return null;
    }
  };

  const graphQL = async function graphQL() {
    // Any additional items to set on `req` (e.g. `{user: {id: 17}}`)
    let reqOptions = {};
    // Place test assertions in this function
    let checker = () => {};

    if (arguments.length === 1) {
      checker = arguments[0];
    } else if (arguments.length == 2) {
      reqOptions = arguments[0];
      checker = arguments[1];
    } else {
      throw new Error('no args supplied to graphQL');
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

    const { pgSettings: pgSettingsGenerator } = options;
    const pgSettings =
      typeof pgSettingsGenerator === 'function'
        ? await pgSettingsGenerator(req)
        : pgSettingsGenerator;

    await withPostGraphileContext(
      {
        ...options,
        pgPool: rootPgPool,
        pgSettings
      },
      async (context) => {
        /* BEGIN: pgClient REPLACEMENT */
        // We're not going to use the `pgClient` that came with
        // `withPostGraphileContext` because we want to ROLLBACK at the end. So
        // we need to replace it, and re-implement the settings logic. Sorry.

        const replacementPgClient = await rootPgPool.connect();
        await replacementPgClient.query('begin');
        await replacementPgClient.query("select set_config('role', $1, true)", [
          POSTGRAPHILE_AUTHENTICATOR_ROLE
        ]);

        const localSettings = new Map();

        // Set the custom provided settings before jwt claims and role are set
        // this prevents an accidentional overwriting
        if (typeof pgSettings === 'object') {
          for (const key of Object.keys(pgSettings)) {
            localSettings.set(key, String(pgSettings[key]));
          }
        }

        // If there is at least one local setting.
        if (localSettings.size !== 0) {
          // Actually create our query.
          const values = [];
          const sqlQuery = `select ${Array.from(localSettings)
            .map(([key, value]) => {
              values.push(key);
              values.push(value);
              return `set_config($${values.length - 1}, $${
                values.length
              }, true)`;
            })
            .join(', ')}`;

          // Execute the query.
          await replacementPgClient.query(sqlQuery, values);
        }
        /* END: pgClient REPLACEMENT */

        let checkResult;
        try {
          // This runs our GraphQL query, passing the replacement client
          const query = async (q, variables) => {
            if (typeof q !== 'string') q = print(q);
            return await graphql(
              schema,
              q,
              null,
              { ...context, pgClient: replacementPgClient },
              variables
            );
          };

          // This is were we call the `checker` so you can do your assertions.
          // Also note that we pass the `replacementPgClient` so that you can
          // query the data in the database from within the transaction before it
          // gets rolled back.
          checkResult = await checker(query, replacementPgClient);
        } finally {
          // Rollback the transaction so no changes are written to the DB - this
          // makes our tests fairly deterministic.
          await replacementPgClient.query('rollback');
          replacementPgClient.release();
        }
        return checkResult;
      }
    );
  };

  const graphQLQuery = async function graphQLQuery() {
    // Any additional items to set on `req` (e.g. `{user: {id: 17}}`)
    let reqOptions = {};
    let Query;
    let vars;
    let commit = false;

    if (arguments.length == 1) {
      Query = arguments[0];
    } else if (arguments.length == 2) {
      if (typeof arguments[1] === 'boolean') {
        Query = arguments[0];
        commit = arguments[1];
      } else {
        if (arguments[0].kind === 'Document') {
          Query = arguments[0];
          vars = arguments[1];
        } else {
          reqOptions = {};
          Query = arguments[1];
        }
      }
    } else if (arguments.length == 3) {
      if (arguments[1].kind === 'Document') {
        reqOptions = arguments[0];
        Query = arguments[1];
      }

      if (typeof arguments[2] === 'boolean') {
        commit = arguments[2];
      } else {
        vars = arguments[2];
      }
    } else if (arguments.length == 4) {
      reqOptions = arguments[0];
      Query = arguments[1];
      vars = arguments[2];
      commit = arguments[3];
    } else {
      throw new Error('no args supplied to graphQL');
    }

    console.log(reqOptions, Query, vars, commit);

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

    const { pgSettings: pgSettingsGenerator } = options;
    const pgSettings =
      typeof pgSettingsGenerator === 'function'
        ? await pgSettingsGenerator(req)
        : pgSettingsGenerator;

    return await withPostGraphileContext(
      {
        ...options,
        pgPool: rootPgPool,
        pgSettings
      },
      async (context) => {
        /* BEGIN: pgClient REPLACEMENT */
        // We're not going to use the `pgClient` that came with
        // `withPostGraphileContext` because we want to ROLLBACK at the end. So
        // we need to replace it, and re-implement the settings logic. Sorry.

        const replacementPgClient = await rootPgPool.connect();
        await replacementPgClient.query('begin');
        await replacementPgClient.query("select set_config('role', $1, true)", [
          POSTGRAPHILE_AUTHENTICATOR_ROLE
        ]);

        const localSettings = new Map();

        // Set the custom provided settings before jwt claims and role are set
        // this prevents an accidentional overwriting
        if (typeof pgSettings === 'object') {
          for (const key of Object.keys(pgSettings)) {
            localSettings.set(key, String(pgSettings[key]));
          }
        }

        // If there is at least one local setting.
        if (localSettings.size !== 0) {
          // Actually create our query.
          const values = [];
          const sqlQuery = `select ${Array.from(localSettings)
            .map(([key, value]) => {
              values.push(key);
              values.push(value);
              return `set_config($${values.length - 1}, $${
                values.length
              }, true)`;
            })
            .join(', ')}`;

          // Execute the query.
          await replacementPgClient.query(sqlQuery, values);
        }
        /* END: pgClient REPLACEMENT */

        let getResult;
        try {
          // This runs our GraphQL query, passing the replacement client
          if (typeof Query !== 'string') Query = print(Query);
          getResult = await graphql(
            schema,
            Query,
            null,
            { ...context, pgClient: replacementPgClient },
            vars
          );
        } finally {
          // Rollback the transaction so no changes are written to the DB - this
          // makes our tests fairly deterministic.

          await replacementPgClient.query(commit ? 'commit' : 'rollback');
          replacementPgClient.release();
        }
        return getResult;
      }
    );
  };

  return {
    setup,
    teardown,
    graphQL,
    graphQLQuery,
    withContext: (cb) => cb(ctx)
  };
};
