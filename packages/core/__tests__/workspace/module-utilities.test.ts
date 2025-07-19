import {
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  latestChange,
  listModules
} from '../../src/modules/modules';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('migrate', 'simple');
});

afterAll(() => {
  fixture.cleanup();
});

describe('sqitch modules', () => {
  it('should get modules', async () => {
    const modules = await listModules(fixture.tempFixtureDir);
    expect(modules).toMatchSnapshot();
  });

  it('should get a module’s last path', async () => {
    const modules = await listModules(fixture.tempFixtureDir);
    const change = await latestChange('totp', modules, fixture.tempFixtureDir);
    expect(change).toBe('procedures/generate_secret');
  });

  it('should create dependencies for cross-project requires', async () => {
    const modules = await listModules(fixture.tempFixtureDir);
    const deps = await getExtensionsAndModules('utils', modules);
    expect(deps).toEqual({
      native: ['plpgsql', 'uuid-ossp'],
      sqitch: ['totp', 'pg-verify'],
    });
  });

  it('should create dependencies for cross-project requires with changes', async () => {
    const modules = await listModules(fixture.tempFixtureDir);
    const deps = await getExtensionsAndModulesChanges('utils', modules, fixture.tempFixtureDir);
    expect(deps).toMatchSnapshot();
  });
});
