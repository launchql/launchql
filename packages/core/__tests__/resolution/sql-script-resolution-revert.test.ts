import { resolve } from '../../src/resolution/resolve';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch', 'resolve', 'basic');
});

afterAll(() => {
  fixture.cleanup();
});

const expectResult = `-- Revert schemas/myschema/tables/sometable/table to pg
begin;
drop table myschema.sometable;
commit;

-- Revert schemas/myschema/schema to pg
begin;
drop schema myschema;
commit;`;

describe('resolve', () => {
  it('resolves sql in proper order', async () => {
    const sql = await resolve(fixture.tempFixtureDir, 'revert');
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
  });
});
