import fs from 'fs';
import os from 'os';
import path from 'path';
import { LaunchQLProject } from '../src/class/launchql';

const FIXTURE_ROOT = path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', 'launchql');

let tempRoot: string;

beforeEach(() => {
  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
  fs.cpSync(FIXTURE_ROOT, tempRoot, { recursive: true });
});

afterEach(() => {
  if (tempRoot && fs.existsSync(tempRoot)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

const getModuleProject = async (name: string): Promise<LaunchQLProject> => {
  const workspace = new LaunchQLProject(tempRoot);

  const moduleMap = workspace.getModuleMap();
  const meta = moduleMap[name];
  if (!meta) throw new Error(`Module ${name} not found in workspace`);

  const modPath = path.join(tempRoot, meta.path);
  const mod = new LaunchQLProject(modPath);
  return mod;
};

describe('LaunchQLProject.writeModulePlan', () => {
  it('writes a clean plan to disk for a module (no projects)', async () => {
    const mod = await getModuleProject('secrets');
    await mod.writeModulePlan({ projects: false });

    const plan = mod.getModulePlan();
    expect(plan).toMatchSnapshot();
  });

  it('writes a clean plan to disk for a module (with projects)', async () => {
    const mod = await getModuleProject('secrets');
    await mod.writeModulePlan({ projects: true });

    const plan = mod.getModulePlan();
    expect(plan).toMatchSnapshot();
  });

  it('writes a plan for a dependency-heavy module (totp)', async () => {
    const mod = await getModuleProject('totp');
    await mod.writeModulePlan({ projects: true });

    const plan = mod.getModulePlan();
    expect(plan).toContain('%project=totp');
    expect(plan).toMatchSnapshot();
  });

  it('writes a plan with project references (utils)', async () => {
    const mod = await getModuleProject('pg-verify');

    mod.setModuleDependencies(['some-native-module', 'pg-utilities']);

    await mod.writeModulePlan({ projects: true });

    const plan = mod.getModulePlan();
    const required = mod.getRequiredModules();
    const deps = mod.getModuleDependencies('pg-verify');
    const make = mod.getModuleMakefile();
    const ctrl = mod.getModuleControlFile();

    expect({
        plan,
        required,
        deps,
        make,
        ctrl
    }).toMatchSnapshot();

    expect(plan).toContain('[pg-utilities:procedures/tg_update_timestamps]');
    expect(plan).toMatchSnapshot();
  });
});
