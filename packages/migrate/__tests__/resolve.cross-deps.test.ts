import { join } from 'path';

import { resolve } from '../src/resolve';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/simple/packages/my-third');

const clean = (str: string) =>
  str
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

describe('resolve works with cross deps', () => {
  it('resolves sql in proper order', async () => {
    const sql = await resolve(
      PROJECT_PATH
    );
    expect(sql).toBeTruthy();
    expect(clean(sql)).toMatchSnapshot();
  });
});
