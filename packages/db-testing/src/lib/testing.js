const v4 = require('uuid/v4');
import { IConnected } from 'pg-promise';
import { createdb, dropdb, templatedb, installExt } from './db';
import { sqitchFast, sqitch } from './sqitch';
import { sqitchPath, getInstalledExtensions } from '@launchql/db-utils';
import { connect, close } from './connection';
import { resolve as pathResolve } from 'path';
import env from '../env';

export const getOpts = async (configOpts) => {
  const { PGUSER, PGPASSWORD, PGPORT, PGHOST, FAST_TEST } = env;
  configOpts = configOpts || {};
  let {
    user = PGUSER,
    password = PGPASSWORD,
    port = PGPORT,
    host = PGHOST,
    hot = FAST_TEST,
    template,
    prefix = 'testing-db',
    directory,
    extensions = []
  } = configOpts;

  if (!directory && !template) {
    directory = await sqitchPath();
  } else if (directory) {
    directory = pathResolve(directory);
  }

  return {
    user,
    password,
    port,
    host,
    hot,
    template,
    prefix,
    directory,
    extensions
  };
};

export const getConnection = async (configOpts, database) => {
  configOpts = await getOpts(configOpts);

  const {
    user,
    password,
    port,
    host,
    hot,
    template,
    prefix,
    directory,
    extensions
  } = configOpts;

  if (!database) {
    database = `${prefix}-${v4()}`;
  }
  const connection = {
    database,
    user,
    port,
    password,
    host
  };

  if (hot) {
    // FAST_TEST=1
    // createdb + hot loaded sql
    await createdb(connection);
    await installExt(connection, extensions);

    await sqitchFast(connection, directory);
  } else if (template) {
    // createdb from a template already with data...
    await templatedb({ ...connection, template });
  } else {
    // createdb + sqitch it
    await createdb(connection);
    await installExt(connection, extensions);
    await sqitch(connection, directory);
  }

  const db = await connect(connection);
  return db;
};

export const closeConnection = async (db) => {
  const { connectionParameters } = db.client;
  close(db);
  await dropdb(connectionParameters);
};

const prefix = 'testing-db';
export const getTestConnection = async () => {
  const options = env.FAST_TEST
    ? {
        hot: true,
        prefix
      }
    : {
        template: env.PGTEMPLATE_DATABASE,
        prefix
      };
  options.extensions = await getInstalledExtensions();
  return await getConnection(options);
};

export const connectTest = async (database, user, password) => {
  let connection = await getOpts();
  connection = { ...connection, database, user, password };
  return await connect(connection);
};

export const createUserRole = async (db, user, password) => {
  await db.any(`
  DO $$
  BEGIN
  IF NOT EXISTS (
          SELECT
              1
          FROM
              pg_roles
          WHERE
              rolname = '${user}') THEN
          CREATE ROLE ${user} LOGIN PASSWORD '${password}';
          GRANT anonymous TO ${user};
          GRANT authenticated TO ${user};
  END IF;
  END $$;
    `);
};

export const grantConnect = async (db, user) => {
  await db.any(`GRANT CONNECT ON DATABASE "${db.client.database}" TO ${user};`);
};

export const getConnections = async () => {
  const db = await getTestConnection();
  const dbName = db.client.database;
  await createUserRole(db, env.APP_USER, env.APP_PASSWORD);
  await grantConnect(db, env.APP_USER);

  const conn = await connectTest(dbName, env.APP_USER, env.APP_PASSWORD);
  conn.setContext({
    role: 'anonymous'
  });
  return { db, conn };
};

export const closeConnections = async ({ db, conn }) => {
  close(conn);
  await closeConnection(db);
};
