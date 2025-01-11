import { join } from 'path';

import { getPlan } from '../src/plans';
import { FIXTURES_PATH } from '../test-utils';
import { getDeps } from '../src/deps';
import { getExtensionName } from '../src/extensions';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/launchql');

/**
 * Cleans up text by trimming lines, removing empty lines, and joining them.
 * @param text - The text to clean.
 * @returns The cleaned text.
 */
const cleanText = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

describe('sqitch modules', () => {
  it('should be able to create a plan', async () => {
    const plan = await getPlan(PROJECT_PATH, { name: 'totp', projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=totp
%uri=totp
procedures/generate_secret 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/generate_secret`)
    );
  });

  it('should be able to create a plan with cross-project requires already in', async () => {
    const plan = await getPlan(PROJECT_PATH, { name: 'utils', projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=utils
%uri=utils
projects/totp/procedures/generate_secret [totp:procedures/generate_secret] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add projects/totp/procedures/generate_secret
procedures/myfunction 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/myfunction`)
    );
  });

  it('should create a plan without options for projects and lose dependencies', async () => {
    const plan = await getPlan(PROJECT_PATH, {
      name: 'secrets',
      projects: false,
    });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=secrets
%uri=secrets
procedures/secretfunction 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/secretfunction
`)
    );
  });

  it('should create a plan that references projects', async () => {
    const plan = await getPlan(PROJECT_PATH, {
      name: 'secrets',
      projects: true,
    });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=secrets
%uri=secrets
procedures/secretfunction [totp:procedures/generate_secret pg-verify:procedures/verify_view] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/secretfunction
`)
    );
  });
});
