import { DbAdmin } from './admin';
import { getEnvOptions, getPgEnvOptions, PgConfig } from '@launchql/types';
import { deploy, deployFast, LaunchQLProject } from '@launchql/migrate';
import { PgTestConnector } from './manager';
import { randomUUID } from 'crypto';
import deepmerge from 'deepmerge';
import { teardownPgPools } from '@launchql/server-utils';

let manager: PgTestConnector;

export interface TestConnectionOptions {
  rootDb?: string;
  template?: string;
  prefix?: string;
  extensions?: string[];
  cwd?: string;
  deployFast?: boolean;
  connection?: {
    user?: string;
    password?: string;
    role?: string;
  }
}

const defaultTestConnOpts: Partial<TestConnectionOptions> = {
  rootDb: process.env.PGROOTDATABASE || 'postgres',
  prefix: 'db-',
  extensions: [],
  cwd: process.cwd(),
  deployFast: true,
  connection: {
    user: 'app_user',
    password: 'app_password',
    role: 'anonymous'
  }
}

const getRootAdmin = (config: PgConfig, connOpts: TestConnectionOptions) => {
  const opts = getPgEnvOptions();
  opts.database = connOpts.rootDb;
  const admin = new DbAdmin(opts);
  return admin;
}

export const getConnections = async (
  _pgConfig: Partial<PgConfig> = {},
  _opts: TestConnectionOptions = {}
) => {

  const connOpts = deepmerge(defaultTestConnOpts, _opts);
  const config: PgConfig = getPgEnvOptions({
    database: `${connOpts.prefix}${randomUUID()}`,
    ..._pgConfig
  });

  const root = getRootAdmin(config, connOpts);
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
