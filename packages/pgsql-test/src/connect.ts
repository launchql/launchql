import { DbAdmin } from './admin';
import {
  getPgEnvOptions,
  TestConnectionOptions,
  PgConfig,
  getConnEnvOptions
} from '@launchql/types';
import { PgTestConnector } from './manager';
import { randomUUID } from 'crypto';

import { teardownPgPools } from '@launchql/server-utils';
import { SeedAdapter } from './seed/types';
import { PgTestClient } from './test-client';

let manager: PgTestConnector;

export const getPgRootAdmin = (connOpts: TestConnectionOptions = {}) => {
  const opts = getPgEnvOptions({
    database: connOpts.rootDb
  });
  const admin = new DbAdmin(opts);
  return admin;
}

export interface GetConnectionOpts {
  pg?: Partial<PgConfig>;
  db?: Partial<TestConnectionOptions>;
}

const getConnOopts = (cn: GetConnectionOpts = {}) => {
  const connect = getConnEnvOptions(cn.db);
  const config: PgConfig = getPgEnvOptions({
    database: `${connect.prefix}${randomUUID()}`,
    ...cn.pg
  });
  return {
    pg: config,
    db: connect
  }

}

export interface GetConnectionResult {
  pg: PgTestClient;
  db: PgTestClient;
  admin: DbAdmin;
  teardown: () => Promise<void>
  manager: PgTestConnector
}

export const getConnections = async (
  cn: GetConnectionOpts = {},
  seedAdapter?: SeedAdapter
): Promise<GetConnectionResult> => {

  cn = getConnOopts(cn);

  const config: PgConfig = cn.pg as PgConfig;
  const connOpts: TestConnectionOptions = cn.db;

  const root = getPgRootAdmin(connOpts);
  await root.createUserRole(
    connOpts.connection.user,
    connOpts.connection.password,
    connOpts.rootDb
  );

  const admin = new DbAdmin(config as PgConfig);
  
  if (process.env.TEST_DB) {
    config.database = process.env.TEST_DB;
  } else if (connOpts.template) {
    admin.createFromTemplate(connOpts.template, config.database);
  } else {
    admin.create(config.database);
    admin.installExtensions(connOpts.extensions);
  }

  await admin.grantConnect(connOpts.connection.user, config.database);

  // Main admin client (optional unless needed elsewhere)
  manager = PgTestConnector.getInstance();
  const pg = manager.getClient(config);

  if (seedAdapter) {
    await seedAdapter.seed({
      connect: connOpts,
      admin,
      config: config,
      pg: manager.getClient(config)
    });
  }


  // App user connection
  const db = manager.getClient({
    ...config,
    user: connOpts.connection.user,
    password: connOpts.connection.password
  });
  db.setContext({ role: 'anonymous' });

  const teardown = async () => {
    await teardownPgPools();
    await manager.closeAll();
  };

  return { pg, db, teardown, manager, admin };
};
