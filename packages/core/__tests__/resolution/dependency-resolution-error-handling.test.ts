import { join } from 'path';

import { resolveDependencies } from '../../src/resolution/deps';
import { FIXTURES_PATH } from '../../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/broken');

it('should validate LaunchQL package dependencies', async () => {
  let failed = false;

  try {
    await resolveDependencies(`${PROJECT_PATH}/packages/secrets`, 'secrets');
  } catch (e: unknown) {
    failed = true;

    if (e instanceof Error) {
      expect(e.message).toMatchSnapshot();;
    } else {
      throw new Error('Caught an unexpected non-error exception');
    }
  }

  expect(failed).toBe(true);
});
