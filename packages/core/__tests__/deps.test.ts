import { join } from 'path';

import { extDeps, getDeps } from '../src/deps';
import { listModules } from '../src/modules';
import { FIXTURES_PATH } from '../test-utils';

const fixture = (...subPaths: string[]) => join(FIXTURES_PATH, ...subPaths);

it('sqitch package dependencies [utils]', async () => {
  const res = await getDeps(
    fixture('sqitch', 'launchql', 'packages', 'utils'),
    'utils'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/1st]', async () => {
  const res = await getDeps(
    fixture('sqitch', 'simple', 'packages', 'my-first'),
    'my-first'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/2nd]', async () => {
  const res = await getDeps(
    fixture('sqitch', 'simple', 'packages', 'my-second'),
    'my-second'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/3nd]', async () => {
  const res = await getDeps(
    fixture('sqitch', 'simple', 'packages', 'my-third'),
    'my-third'
  );
  expect(res).toMatchSnapshot();
});

it('launchql project extensions dependencies', async () => {
  const modules = listModules(fixture('sqitch', 'launchql'));

  const utils = await extDeps('utils', modules);
  expect(utils).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp',
      'utils'
    ]
  });

  const secrets = await extDeps('secrets', modules);
  expect(secrets).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp',
      'secrets'
    ]
  });

  const totp = await extDeps('totp', modules);
  expect(totp).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp'
    ]
  });
});
