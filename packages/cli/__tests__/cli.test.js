import { getCurrentContext, getConfig } from '../src/lib/api/env';

const LQLPATH = __dirname + '/../__fixtures__/';

let env, context, config, current;
beforeAll(async () => {
  config = await getConfig(LQLPATH);
  current = await getCurrentContext(LQLPATH);
});

describe('configurations', () => {
  it('config', async () => {
    expect(config).toMatchSnapshot();
  });
  it('current', async () => {
    expect(current).toMatchSnapshot();
  });
});
