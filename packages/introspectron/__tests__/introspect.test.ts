import { introspect, introspectionResultsFromRaw } from '../src';
const pg = require('pg');
const jsonStringify = require('json-stringify-safe');

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
let raw;
it('introspect', async () => {
  raw = await introspect(pgPool, {
    schemas: ['app_public']
  });
  expect(raw).toMatchSnapshot();
  const processed = introspectionResultsFromRaw(raw);
  require('fs').writeFileSync(
    __dirname + '/introspect.json',
    jsonStringify(processed, null, 2)
  );
});
