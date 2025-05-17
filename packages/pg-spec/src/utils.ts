import { Client, Pool } from 'pg';
// import { createdb, dropdb, templatedb, installExt, grantConnect } from './db';
import { connect, close } from './legacy-connect';
import { getPgEnvOptions, PgConfig } from '@launchql/types';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { PgTestClient } from './test-client';
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
  } else {
    admin.create(config.database);
    admin.installExtensions(opts.extensions);
  }

  return connect(config);
}