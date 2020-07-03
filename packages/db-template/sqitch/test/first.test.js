import { getConnections } from './utils';

let teardown, db, conn;
const objs = {};
describe('signup', () => {
  beforeAll(async () => {
    ({ db, conn, teardown } = await getConnections());
  });
  afterAll(async () => {
    await teardown();
  });
  describe('has a database', () => {
    it('query your  database', async () => {
      const res = await db.any('SELECT 1');
      expect(res.length).toBe(0);
    });
  });
});
