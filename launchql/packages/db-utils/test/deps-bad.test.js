process.env.SKITCH_PATH = __dirname + '/../__fixtures__/broken';
import { getDeps, extDeps } from '../src/lib/deps';

describe('deps', () => {
  it('sqitch package dependencies', async () => {
    let failed = false;
    try {
      const res = await getDeps(
        __dirname + '/../__fixtures__/broken/packages/secrets',
        'secrets'
      );
    } catch (e) {
      failed = true;
      expect(e.message).toMatchSnapshot();
    }
    expect(failed).toBe(true);
  });
});
