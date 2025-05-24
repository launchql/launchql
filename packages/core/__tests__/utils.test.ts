import { join } from 'path';

import { getExtensionsAndModules, getExtensionsAndModulesChanges, latestChange, listModules } from '../src/modules';
import { FIXTURES_PATH } from '../test-utils';

const PROJECT_PATH = join(FIXTURES_PATH, 'sqitch/launchql');

describe('sqitch modules', () => {
  it('should get modules', async () => {
    const modules = await listModules(PROJECT_PATH);
    expect(modules).toMatchSnapshot();
  });

  it('should get a module’s last path', async () => {
    const modules = await listModules(PROJECT_PATH);
    const change = await latestChange('totp', modules, PROJECT_PATH);
    expect(change).toBe('procedures/generate_secret');
  });

  it('should create dependencies for cross-project requires', async () => {
    const modules = await listModules(PROJECT_PATH);
    const deps = await getExtensionsAndModules('utils', modules);
    expect(deps).toEqual({
      native: ['plpgsql', 'uuid-ossp'],
      sqitch: ['totp', 'pg-verify'],
    });
  });

  it('should create dependencies for cross-project requires with changes', async () => {
    const modules = await listModules(PROJECT_PATH);
    const deps = await getExtensionsAndModulesChanges('utils', modules, PROJECT_PATH);
    expect(deps).toMatchSnapshot();
  });
});
