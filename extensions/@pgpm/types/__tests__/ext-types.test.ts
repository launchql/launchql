import { getConnections, PgTestClient } from 'pgsql-test';

let teardown: () => Promise<void>;
let pg: PgTestClient;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

describe('@pgql/types', () => {
  it('creates domain types', async () => {
    const { typname } = await pg.one(
      `SELECT typname FROM pg_type WHERE typname = 'url'`
    );
    expect(typname).toBe('url');
  });
});
