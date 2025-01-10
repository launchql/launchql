import { join } from 'path';

import { getDeps } from '../src/deps';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/broken');

it('should validate LaunchQL package dependencies', async () => {
  let failed = false;

  try {
    await getDeps(`${PROJECT_PATH}/packages/secrets`, 'secrets');
  } catch (e: unknown) {
    failed = true;

    if (e instanceof Error) {
      expect(e.message).toBe(
        `referencing bad project name inside of deploy file\n-- Deploy not_secrets:procedures/secretfunction to pg`
      );
    } else {
      throw new Error('Caught an unexpected non-error exception');
    }
  }

  expect(failed).toBe(true);
});
