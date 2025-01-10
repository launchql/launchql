import * as testing from '@launchql/db-testing';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const prefix = 'testing-db';

export const getConnection = async () => {
  const options = process.env.FAST_TEST
    ? {
        hot: true,
        prefix,
      }
    : {
        template: process.env.PGTEMPLATE_DATABASE,
        prefix,
      };
  options.extensions = process.env.PGEXTENSIONS;
  return await testing.getConnection(options);
};

export const closeConnection = async db => {
  await testing.closeConnection(db);
};

export const close = db => {
  testing.close(db);
};

export const connect = async (database, user, password) => {
  let connection = await testing.getOpts();
  connection = { ...connection, database, user, password };
  return await testing.connect(connection);
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

export const getConnections = async () => {
  const db = await getConnection();
  const dbName = db.client.database;
  await createUserRole(db, process.env.APP_USER, process.env.APP_PASSWORD);
  const conn = await connect(dbName, process.env.APP_USER, process.env.APP_PASSWORD);
  return {db, conn};
}

export const closeConnections = async ({db, conn}) => {
  close(conn);
  await closeConnection(db);
}
