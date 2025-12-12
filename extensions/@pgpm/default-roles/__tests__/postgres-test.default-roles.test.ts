import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});


afterAll(async () => {
  await teardown();
});


it('should have the required roles', async () => {
  const result = await pg.query(`
    SELECT rolname
    FROM pg_roles
    WHERE rolname IN ('authenticated', 'anonymous', 'administrator');
  `);
  expect(result.rows.length).toBeGreaterThan(0);
});
