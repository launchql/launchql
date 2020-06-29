import { build } from '../src/lib/build';
process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';

const clean = (t) =>
  t
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

describe('build', () => {
  it('works', async () => {
    const results = await build('secrets');
    expect(clean(results)).toMatchSnapshot();
  });
});
