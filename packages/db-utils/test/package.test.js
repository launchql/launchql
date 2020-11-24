import { packageModule } from '../src/lib/package';
process.env.SKITCH_PATH = __dirname + '/../__fixtures__/skitch';
process.env.SQITCH_PATH =
  __dirname + '/../__fixtures__/skitch/packages/secrets';

const clean = (t) =>
  t
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

it('creates an extension', async () => {
  const { sql } = await packageModule();
  expect(clean(sql)).toMatchSnapshot();
});
it('creates an extension via plan', async () => {
  const { sql } = await packageModule({ usePlan: true });
  expect(clean(sql)).toMatchSnapshot();
});
