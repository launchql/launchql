import { getConnEnvOptions } from '@pgpmjs/env';
import { PgTestConnectionOptions } from '@pgpmjs/types';
import { randomUUID } from 'crypto';
import { teardownPgPools } from 'pg-cache';
import {
  getPgEnvOptions,
  PgConfig,
} from 'pg-env';

import { DbAdmin } from './admin';
import { PgTestConnector } from './manager';
import { getDefaultRole } from './roles';
import { seed } from './seed';
import { SeedAdapter } from './seed/types';
import { PgTestClient } from './test-client';

let manager: PgTestConnector;

export const getPgRootAdmin = (config: PgConfig, connOpts: PgTestConnectionOptions = {}) => {
  const opts = getPgEnvOptions({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: connOpts.rootDb
  });
  const admin = new DbAdmin(opts, false, connOpts);
  return admin;
};

export interface GetConnectionOpts {
  pg?: Partial<PgConfig>;
  db?: Partial<PgTestConnectionOptions>;
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
  };
};

export interface GetConnectionResult {
  pg: PgTestClient;
  db: PgTestClient;
  admin: DbAdmin;
  teardown: () => Promise<void>
  manager: PgTestConnector
}

export const getConnections = async (
  cn: GetConnectionOpts = {},
  seedAdapters: SeedAdapter[] = [ seed.launchql() ]
): Promise<GetConnectionResult> => {

  cn = getConnOopts(cn);

  const config: PgConfig = cn.pg as PgConfig;
  const connOpts: PgTestConnectionOptions = cn.db;

  const root = getPgRootAdmin(config, connOpts);
  await root.createUserRole(
    connOpts.connection.user,
    connOpts.connection.password,
    connOpts.rootDb
  );

  const admin = new DbAdmin(config as PgConfig, false, connOpts);
  
  if (process.env.TEST_DB) {
    config.database = process.env.TEST_DB;
  } else if (connOpts.template) {
    admin.createFromTemplate(connOpts.template, config.database);
  } else {
    admin.create(config.database);
    admin.installExtensions(connOpts.extensions);
  }

  await admin.grantConnect(connOpts.connection.user, config.database);

  manager = PgTestConnector.getInstance(config);
  const pg = manager.getClient(config);

  let teardownPromise: Promise<void> | null = null;
  const teardown = async () => {
    if (teardownPromise) return teardownPromise;
    teardownPromise = (async () => {
      manager.beginTeardown();
      await teardownPgPools();
      await manager.closeAll();
    })();
    return teardownPromise;
  };

  if (seedAdapters.length) {
    try {
      await seed.compose(seedAdapters).seed({
        connect: connOpts,
        admin,
        config: config,
        pg: manager.getClient(config)
      });
    } catch (error) {
      const err: any = error as any;
      const msg = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
      process.stderr.write(`[pgsql-test] Seed error (continuing): ${msg}\n`);
      // continue without teardown to allow caller-managed lifecycle
    }
  }

  const dbConfig = {
    ...config,
    user: connOpts.connection.user,
    password: connOpts.connection.password
  } as PgConfig;
  
  const db = manager.getClient(dbConfig, {
    auth: connOpts.auth,
    roles: connOpts.roles
  });
  db.setContext({ role: getDefaultRole(connOpts) });
  
  return { pg, db, teardown, manager, admin };
};
