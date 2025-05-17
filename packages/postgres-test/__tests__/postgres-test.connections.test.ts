import { getPgEnvOptions } from '@launchql/types';
import { Connection, getConnections } from '../src';
import { PgTestClient } from '../src/client';

// let client: PgTestClient;
let conn: PgTestClient;
let db: PgTestClient;
let teardown: any;
beforeAll(async () => {
//   client = Connection.connect(getPgEnvOptions())
   ({ conn, db, teardown } = await getConnections())
});

afterAll(async () => {
    await Connection.getManager().closeAll();
    // await teardown();
});

describe('Postgres Test Framework', () => {
  let db: PgTestClient;

  afterEach(() => {
    if (db) db.afterEach()
  });

  it('creates a test DB', async () => {
    const result = await conn.query('SELECT 1');
    console.log(result);

  });
});
