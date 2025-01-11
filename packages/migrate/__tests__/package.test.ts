import { join } from 'path';

import { packageModule } from '../src/package';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/launchql');
const MODULE_PATH = join(PROJECT_PATH, 'packages/secrets');

/**
 * Cleans up SQL text by trimming lines, removing empty lines, and joining them.
 * @param text - The SQL text to clean.
 * @returns The cleaned SQL text.
 */
const clean = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

describe('packageModule tests', () => {
  it('creates an extension', async () => {
    const { sql } = await packageModule(MODULE_PATH);
    expect(clean(sql)).toMatchSnapshot();
  });

  it('creates an extension via plan', async () => {
    const { sql } = await packageModule(MODULE_PATH, { usePlan: true });
    expect(clean(sql)).toMatchSnapshot();
  });
});
