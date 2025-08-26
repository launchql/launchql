import {
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  latestChange
} from '../../src/modules/modules';
import { LaunchQLPackage } from '../../src/core/class/launchql';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;
let pkg: LaunchQLPackage;

beforeAll(() => {
  fixture = new TestFixture('sqitch', 'launchql');
  pkg = new LaunchQLPackage(fixture.tempFixtureDir);
});

afterAll(() => {
  fixture.cleanup();
});

describe('sqitch modules', () => {
  it('should get modules', async () => {
    const modules = pkg.getModuleMap();
    expect(modules).toMatchSnapshot();
  });

  it('should get a module last path', async () => {
    const modules = pkg.getModuleMap();
    const change = await latestChange('totp', modules, fixture.tempFixtureDir);
    expect(change).toBe('procedures/generate_secret');
  });

  it('should create dependencies for cross-project requires', async () => {
    const modules = pkg.getModuleMap();
    const deps = await getExtensionsAndModules('utils', modules);
    expect(deps).toEqual({
      native: ['plpgsql', 'uuid-ossp'],
      sqitch: ['totp', 'pg-verify'],
    });
  });

  it('should create dependencies for cross-project requires with changes', async () => {
    const modules = pkg.getModuleMap();
    const deps = await getExtensionsAndModulesChanges('utils', modules, fixture.tempFixtureDir);
    expect(deps).toMatchSnapshot();
  });
});
