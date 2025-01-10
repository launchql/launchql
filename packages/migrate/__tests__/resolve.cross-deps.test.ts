import { join } from 'path';

import { resolve } from '../src/resolve';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/launchql/packages/utils');

const clean = (str: string) =>
  str
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

const expectResult = `-- Deploy projects/totp/procedures/generate_secret to pg
-- requires: totp:procedures/generate_secret

BEGIN;

-- XXX Add DDLs here.

COMMIT;

-- Deploy procedures/myfunction to pg
BEGIN;

CREATE FUNCTION myfunction() returns int as $$
 SELECT 1;
$$
LANGUAGE 'sql' STABLE;

COMMIT;`;

describe('resolve works with cross deps', () => {
  it('resolves sql in proper order', async () => {
    const sql = await resolve(
      PROJECT_PATH
    );
    expect(sql).toBeTruthy();
    expect(clean(sql)).toEqual(clean(expectResult));
  });
});
