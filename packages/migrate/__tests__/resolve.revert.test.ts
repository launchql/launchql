import { join } from 'path';

import { resolve } from '../src/resolve';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/resolve/basic');

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
    const sql = await resolve(
      PROJECT_PATH,
      'revert'
    );
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
  });
});
