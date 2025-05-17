import { getPgEnvOptions } from '@launchql/types';
import { PgTestClient } from '../src/client';
import { getConnections } from '../src/connect';

// let client: PgTestClient;
let conn: PgTestClient;
let db: PgTestClient;
let teardown: any;
beforeAll(async () => {
   ({ conn, db, teardown } = await getConnections())
});

afterAll(async () => {
    await teardown();
});

describe('Postgres Test Framework', () => {
  let db: PgTestClient;

  afterEach(() => {
    if (db) db.afterEach()
  });

  it('creates a test DB', async () => {
    const result = await conn.query('SELECT 1');
    // console.log(result);

  });
});
