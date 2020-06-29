import { resolve } from '../src/lib/resolve';

const clean = (str) =>
  str
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

const expectResult = `-- Deploy procedures/myfunction to pg
BEGIN;

CREATE FUNCTION myfunction() returns int as $$
 SELECT 1;
$$
LANGUAGE 'sql' STABLE;

COMMIT;

-- Deploy projects/totp/procedures/generate_secret to pg
-- requires: totp:procedures/generate_secret

BEGIN;

-- XXX Add DDLs here.

COMMIT;`;

describe('resolve works with cross deps', () => {
  it('resolves sql in proper order', async () => {
    const sql = await resolve(__dirname + '/fixtures/skitch/packages/utils');
    expect(sql).toBeTruthy();
    expect(clean(sql)).toEqual(clean(expectResult));
  });
});
