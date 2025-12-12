import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});


it('totp.generate + totp.verify basic', async () => {
  const { generate } = await pg.one(
    `SELECT totp.generate($1::text) AS generate`,
    ['secret']
  );
  const { verify } = await pg.one(
    `SELECT totp.verify($1::text, $2::text) AS verify`,
    ['secret', generate]
  );
  expect(typeof generate).toBe('string');
  expect(verify).toBe(true);
});
