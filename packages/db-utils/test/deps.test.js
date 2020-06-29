process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';
import { getDeps, extDeps } from '../src/lib/deps';

describe('deps', () => {
  it('sqitch package dependencies', async () => {
    const res = await getDeps(
      __dirname + '/fixtures/skitch/packages/utils',
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
        'procedures/myfunction',
        'totp:procedures/generate_secret',
        'projects/totp/procedures/generate_secret'
      ]
    });
  });
  it('skitch project extensions dependencies', async () => {
    const utils = await extDeps('utils');
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
    const secrets = await extDeps('secrets');
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
    const totp = await extDeps('totp');
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
});
