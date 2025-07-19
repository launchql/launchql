import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeEach(() => {
  fixture = new TestFixture('migrate', 'simple');
});

afterEach(() => {
  fixture.cleanup();
});

describe('LaunchQLProject.writeModulePlan', () => {
  it('writes a clean plan to disk for a module (no projects)', async () => {
    const mod = fixture.getModuleProject(['.'], 'secrets');
    await mod.writeModulePlan({ projects: false });

    const plan = mod.getModulePlan();
    expect(plan).toMatchSnapshot();
  });

  it('writes a clean plan to disk for a module (with projects)', async () => {
    const mod = fixture.getModuleProject(['.'], 'secrets');
    await mod.writeModulePlan({ projects: true });

    const plan = mod.getModulePlan();
    expect(plan).toMatchSnapshot();
  });

  it('writes a plan for a dependency-heavy module (totp)', async () => {
    const mod = fixture.getModuleProject(['.'], 'totp');
    await mod.writeModulePlan({ projects: true });

    const plan = mod.getModulePlan();
    expect(plan).toContain('%project=totp');
    expect(plan).toMatchSnapshot();
  });

  it('writes a plan with project references (utils)', async () => {
    const mod = fixture.getModuleProject(['.'], 'pg-verify');

    mod.setModuleDependencies(['some-native-module', 'pg-utilities']);
    await mod.writeModulePlan({ projects: true });

    const result = {
      plan: mod.getModulePlan(),
      required: mod.getRequiredModules(),
      deps: mod.getModuleDependencies('pg-verify'),
      make: mod.getModuleMakefile(),
      ctrl: mod.getModuleControlFile()
    };

    expect(result).toMatchSnapshot();
    expect(result.plan).toContain('[pg-utilities:procedures/tg_update_timestamps]');
  });
});
