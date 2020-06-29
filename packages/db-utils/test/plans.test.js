process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';

import { getPlan } from '../src/index';

const cleanText = (t) =>
  t
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

describe('sqitch modules', () => {
  it('should be able to create a plan', async () => {
    const plan = await getPlan({ name: 'totp', projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=totp
%uri=totp
procedures/generate_secret 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/generate_secret`)
    );
  });
  it('should be able to create a plan with cross project requires already in', async () => {
    const plan = await getPlan({ name: 'utils', projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=utils
%uri=utils
procedures/myfunction 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/myfunction
projects/totp/procedures/generate_secret [totp:procedures/generate_secret] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add projects/totp/procedures/generate_secret`)
    );
  });
  it('create a plan without options for projects loses deps', async () => {
    const plan = await getPlan({
      name: 'secrets',
      projects: false
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
  it('create a plan that references projects', async () => {
    const plan = await getPlan({
      name: 'secrets',
      projects: true
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
