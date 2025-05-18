import { DbAdmin } from './admin';
import { 
  getEnvOptions,
  getPgEnvOptions,
  TestConnectionOptions,
  PgConfig,
  getConnEnvOptions
} from '@launchql/types';
import { deploy, deployFast, LaunchQLProject } from '@launchql/migrate';
import { PgTestConnector } from './manager';
import { randomUUID } from 'crypto';

import { teardownPgPools } from '@launchql/server-utils';

let manager: PgTestConnector;

export const getPgRootAdmin = (connOpts: TestConnectionOptions={}) => {
  const opts = getPgEnvOptions({
    database: connOpts.rootDb
  });
  const admin = new DbAdmin(opts);
  return admin;
}

export const getConnections = async (
  _pgConfig: Partial<PgConfig> = {},
  _opts: TestConnectionOptions = {}
) => {

  const connOpts = getConnEnvOptions(_opts);
  const config: PgConfig = getPgEnvOptions({
    database: `${connOpts.prefix}${randomUUID()}`,
    ..._pgConfig
  });

  const root = getPgRootAdmin(connOpts);
  await root.createUserRole(
    connOpts.connection.user,
    connOpts.connection.password,
    connOpts.rootDb
  );

  const admin = new DbAdmin(config);
  const proj = new LaunchQLProject(connOpts.cwd);
  if (proj.isInModule()) {
    admin.create(config.database);
    admin.installExtensions(connOpts.extensions);
    const opts = getEnvOptions({
      pg: config
    })
    if (connOpts.deployFast) {
      await deployFast({
        opts,
        name: proj.getModuleName(),
        database: config.database,
        dir: proj.modulePath,
        usePlan: true,
        verbose: false
      })
    } else {
      await deploy(opts, proj.getModuleName(), config.database, proj.modulePath);
    }
  } else {
    // Create the test database
    if (process.env.TEST_DB) {
      config.database = process.env.TEST_DB;
    } else if (connOpts.template) {
      admin.createFromTemplate(connOpts.template, config.database);
    } else {
      admin.create(config.database);
      admin.installExtensions(connOpts.extensions);
    }

  }

  await admin.grantConnect(connOpts.connection.user, config.database);

  // Main admin client (optional unless needed elsewhere)
  manager = PgTestConnector.getInstance();
  const pg = manager.getClient(config);
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

  return { pg, db, teardown, manager };
};
