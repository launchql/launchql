process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';

import {
  listModules,
  latestChange,
  getPlan,
  getExtensionsAndModules,
  getExtensionsAndModulesChanges
} from '../src/index';

const cleanText = (t) =>
  t
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a)
    .join('\n');

describe('sqitch modules', () => {
  it('should get modules', async () => {
    const modules = await listModules();
    expect(modules).toMatchSnapshot();
  });
  it('should get a modules last path', async () => {
    const change = await latestChange('totp');
    expect(change).toEqual('procedures/generate_secret');
  });
  it('should be able to create a deps for cross-project requires', async () => {
    const deps = await getExtensionsAndModules('utils');
    expect(deps).toEqual({
      native: ['plpgsql', 'uuid-ossp'],
      sqitch: ['totp', 'pg-verify']
    });
  });
  it('should be able to create a deps for cross-project requires with changes', async () => {
    const deps = await getExtensionsAndModulesChanges('utils');
    expect(deps).toMatchSnapshot();
  });
});
