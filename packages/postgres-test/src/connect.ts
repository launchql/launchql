import { randomUUID } from 'crypto';
import { getPgEnvOptions, PgConfig } from '@launchql/types';
import { PgTestConnector } from './manager';
import { DbAdmin } from './admin';
import { getTestConnection } from './utils'; // adjust as needed

let manager: PgTestConnector;
export const getConnections = async () => {
  const config: PgConfig = getPgEnvOptions({
    database: `db-${randomUUID()}`
  });

  const app_user = 'app_user';
  const app_password = 'app_password';

  const admin = new DbAdmin(config);

  // Create the test database
  admin.create(config.database);

  // Main admin client (optional unless needed elsewhere)
  manager = PgTestConnector.getInstance();
  const db = manager.getClient(config);

  // Set up test role
  admin.createUserRole(app_user, app_password, config.database);
  admin.grantConnect(app_user, config.database);

  // App user connection
  const conn = manager.getClient({
    ...config,
    user: app_user,
    password: app_password
  })
//   const conn = await getTestConnection(config.database, app_user, app_password);
  conn.setContext({ role: 'anonymous' });

  const teardown = async () => {
    await manager.closeAll();
  };

  return { db, conn, teardown };
};
