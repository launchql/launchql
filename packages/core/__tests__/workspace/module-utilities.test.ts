import {
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  latestChange
} from '../../src/modules/modules';
import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch', 'launchql');
});

afterAll(() => {
  fixture.cleanup();
});

describe('sqitch modules', () => {
  it('should get modules', async () => {
    const pkg = new PgpmPackage(fixture.tempFixtureDir);
    const modules = pkg.listModules();
    expect(modules).toMatchSnapshot();
  });

  it('should get a module’s last path', async () => {
    const pkg = new PgpmPackage(fixture.tempFixtureDir);
    const modules = pkg.listModules();
    const change = await latestChange('totp', modules, fixture.tempFixtureDir);
    expect(change).toBe('procedures/generate_secret');
  });

  it('should create dependencies for cross-project requires', async () => {
    const pkg = new PgpmPackage(fixture.tempFixtureDir);
    const modules = pkg.listModules();
    const deps = await getExtensionsAndModules('utils', modules);
    expect(deps).toEqual({
      native: ['plpgsql', 'uuid-ossp'],
      sqitch: ['totp', 'pg-verify'],
    });
  });

  it('should create dependencies for cross-project requires with changes', async () => {
    const pkg = new PgpmPackage(fixture.tempFixtureDir);
    const modules = pkg.listModules();
    const deps = await getExtensionsAndModulesChanges('utils', modules, fixture.tempFixtureDir);
    expect(deps).toMatchSnapshot();
  });
});
