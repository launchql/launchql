import { resolve } from '../src/lib/resolve';

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
    const sql = await resolve(__dirname + '/fixtures/resolve/basic', 'revert');
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
  });
});
