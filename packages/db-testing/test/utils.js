jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
require('dotenv').load();

import { connectionString } from '../src/index';

import pgPromise from 'pg-promise';

const pgp = pgPromise({
  noWarnings: true
});

const { PGHOST, PGPASSWORD, PGPORT, PGUSER } = process.env;

export const getConnObj = (config = {}) => {
  if (!config.host) {
    config.host = PGHOST;
  }
  if (!config.password) {
    config.password = PGPASSWORD;
  }
  if (!config.user) {
    config.user = PGUSER;
  }
  if (!config.port && PGPORT) {
    config.port = parseInt(PGPORT, 10);
  }

  if (!config.port || !config.user || !config.host) {
    throw new Error('db config NEEDS info!');
  }

  return config;
};

export const config = getConnObj();

export const getConnStr = (config) => connectionString(getConnObj(config));

export async function cleanup(database) {
  const client = await pgp(getConnObj({ database: 'postgres' }));
  const db = await client.connect({ direct: true });
  await db.any(`DROP DATABASE "${database}"`);
  db.done();
}

export async function verifydb(database) {
  const client = await pgp(getConnObj({ database }));
  const db = await client.connect({ direct: true });
  const type = await db.one(`SELECT * FROM pg_type LIMIT 1`);
  expect(type).toBeTruthy();
  db.done();
}

export async function expectBasicSeed(db) {
  await db.any(
    `INSERT INTO myschema.sometable (name) VALUES ('joe'), ('steve'), ('mary'), ('rachel');`
  );
  expect(await db.any(`SELECT * FROM myschema.sometable`)).toEqual([
    { id: 1, name: 'joe' },
    { id: 2, name: 'steve' },
    { id: 3, name: 'mary' },
    { id: 4, name: 'rachel' }
  ]);
}
