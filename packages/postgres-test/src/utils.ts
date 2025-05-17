import { Client, Pool } from 'pg';
import { createdb, dropdb, templatedb, installExt, grantConnect } from './db';
import { connect, close } from './connection';
import { PgConfig } from './types';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { PgWrapper } from './wrapper';

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

export function getConnection(configOpts: TestOptions, database?: string): PgWrapper {
  const envOpts = getEnvOptions();
  const opts = getOpts(configOpts);
  const dbName = database || `${opts.prefix}-${Date.now()}`;

  const config: PgConfig = {
    database: dbName,
    user: envOpts.pg.user,
    password: envOpts.pg.password,
    port: envOpts.pg.port,
    host: envOpts.pg.host
  };

  if (process.env.TEST_DB) {
    config.database = process.env.TEST_DB;
  } else if (opts.hot) {
    createdb(config);
    installExt(config, opts.extensions);
  } else if (opts.template) {
    templatedb({ ...config, template: opts.template });
  } else {
    createdb(config);
    installExt(config, opts.extensions);
  }

  return connect(config);
}

export function closeConnection(db: PgWrapper): void {
  db.kill();
}

export function connectTest(database: string, user: string, password: string): PgWrapper {
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

export async function createUserRole(db: PgWrapper, user: string, password: string): Promise<void> {
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

export function closeConnections({ db, conn }: { db: PgWrapper; conn: PgWrapper }): void {
  conn.close();
  closeConnection(db);
}

export const getConnections = async () => {
  const opts = getEnvOptions({
    pg: {
      database: `db-${randomUUID()}` 
    }
  });
  
  const config: PgConfig = {
    user: opts.pg.user,
    port: opts.pg.port,
    password: opts.pg.password,
    host: opts.pg.host,
    database: opts.pg.database
  };

  const db = await getConnection({

  });
  
  await createUserRole(db, 'app_user', 'app_password');
  await grantConnect(config, 'app_user');

  const conn = await connectTest(opts.pg.database, 'app_user', 'app_password');
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

