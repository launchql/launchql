import { join } from 'path';

import { extDeps, getDeps } from '../src/deps';
import { listModules } from '../src/modules';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/launchql');

it('sqitch package dependencies', async () => {
  const res = await getDeps(
    `${PROJECT_PATH}/packages/utils`,
    'utils'
  );
  expect(res).toEqual({
    deps: {
      '/deploy/procedures/myfunction.sql': [],
      '/deploy/projects/totp/procedures/generate_secret.sql': [
        'totp:procedures/generate_secret'
      ],
      'totp:procedures/generate_secret': []
    },
    external: ['totp:procedures/generate_secret'],
    resolved: [
      'totp:procedures/generate_secret',
      'projects/totp/procedures/generate_secret',
      'procedures/myfunction'
    ]
  });
});
it('launchql project extensions dependencies', async () => {
  const modules = listModules(PROJECT_PATH);
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
