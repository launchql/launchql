import { packageModule } from '../src/lib/package';
process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';
process.env.SQITCH_PATH = __dirname + '/fixtures/skitch/packages/secrets';

const clean = (t) =>
  t
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

describe('package', () => {
  it('creates an extension', async () => {
    const { sql } = await packageModule();
    expect(clean(sql)).toMatchSnapshot();
  });
});
