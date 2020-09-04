const pg = require('pg');
import { introspect } from '../src';

const getDbString = (db) =>
  `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${db}`;

let pgPool;
beforeAll(() => {
  pgPool = new pg.Pool({
    connectionString: getDbString('testdb')
  });
});
afterAll(() => {
  pgPool.end();
});

it('introspect', async () => {
  const result = await introspect(pgPool, {
    schemas: ['app_public']
  });
  expect(result).toMatchSnapshot();
});
