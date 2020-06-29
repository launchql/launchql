import * as testing from '@launchql/db-testing';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const getConnection = async () => {
  return await testing.getTestConnection();
};

export { closeConnection, getConnections, closeConnections } from '@launchql/db-testing'
