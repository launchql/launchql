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
      await db.any('INSERT INTO myschema.mytable DEFAULT VALUES');
      const res = await db.any('SELECT * FROM myschema.mytable');
      console.log(res);
      expect(res.length).toBe(1);
      expect(res.length).toBe(0);
    });
  });
});
