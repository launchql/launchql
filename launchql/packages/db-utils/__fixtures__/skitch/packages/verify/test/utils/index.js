import * as testing from '@launchql/db-testing';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const prefix = 'testing-db';
export const getConnection = async () => {
  const options = process.env.FAST_TEST
    ? {
        hot: true,
        prefix
      }
    : {
        template: process.env.PGTEMPLATE_DATABASE,
        prefix
      };
  return await testing.getConnection(options);
};

export const closeConnection = async (db) => {
  await testing.closeConnection(db);
};
