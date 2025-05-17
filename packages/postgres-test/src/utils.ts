import { Client, Pool } from 'pg';
// import { createdb, dropdb, templatedb, installExt, grantConnect } from './db';
import { connect, close } from './connection';
import { getPgEnvOptions, PgConfig } from '@launchql/types';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { PgTestClient } from './client';
import { DbAdmin } from './admin';

export interface TestOptions {
  hot?: boolean;
  template?: string;
  prefix?: string;
  extensions?: string[];
}

export function getOpts(configOpts: TestOptions = {}): TestOptions {
  return {
    template: configOpts.template,
    prefix: configOpts.prefix || 'testing-db',
    extensions: configOpts.extensions || [],
  };
}

export function getConnection(configOpts: TestOptions, database?: string): PgTestClient {
  const opts = getOpts(configOpts);
  const dbName = database || `${opts.prefix}-${Date.now()}`;

  const config = getPgEnvOptions({
    database: dbName
  });

  const admin = new DbAdmin(config);

  if (process.env.TEST_DB) {
    config.database = process.env.TEST_DB;
  } else if (opts.hot) {
    admin.create(config.database);
    admin.installExtensions(opts.extensions);
  } else if (opts.template) {
    admin.createFromTemplate(opts.template, config.database);
    // admin.createFromTemplate(config.database, opts.template);
  } else {
    admin.create(config.database);
    admin.installExtensions(opts.extensions);
  }

  return connect(config);
}

export function closeConnection(db: PgTestClient): void {
  // db.kill();
}

export function connectTest(database: string, user: string, password: string): PgTestClient {
  const envOpts = getEnvOptions();
  const config: PgConfig = {
    port: envOpts.pg.port,
    host: envOpts.pg.host,
    database,
    user,
    password
  };
  return connect(config);
}

export async function createUserRole(db: PgTestClient, user: string, password: string): Promise<void> {
  await db.query(`
    DO $$
    BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_roles WHERE rolname = '${user}'
    ) THEN
      CREATE ROLE ${user} LOGIN PASSWORD '${password}';
      GRANT anonymous TO ${user};
      GRANT authenticated TO ${user};
    END IF;
    END $$;
  `);
}

export function closeConnections({ db, conn }: { db: PgTestClient; conn: PgTestClient }): void {
  conn.close();
  closeConnection(db);
}

export const getConnections = async () => {
  
  const config = getPgEnvOptions({
    database: `db-${randomUUID()}`
  })

  const admin = new DbAdmin(config);

  const db = await getConnection({

  });
  
  await createUserRole(db, 'app_user', 'app_password');
  admin.grantConnect('app_user', config.database);
  // await grantConnect(config, 'app_user');

  const conn = await connectTest(config.database, 'app_user', 'app_password');
  conn.setContext({
    role: 'anonymous'
  });

  const teardown = async () => {
    await closeConnections({ db, conn });
  };

  return { db, conn, teardown };
};


// export async function grantConnect(db: any, user: string): Promise<void> {
//   await db.query(`GRANT CONNECT ON DATABASE "${db.database}" TO ${user};`);
// }

