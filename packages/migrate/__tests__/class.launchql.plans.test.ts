import path from 'path';
import { LaunchQLProject } from '../src/class/launchql';

const fixture = (p: string[]) =>
  path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', ...p);

/**
 * Cleans up text by trimming lines, removing empty lines, and joining them.
 */
const cleanText = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

const getModuleProject = async (name: string): Promise<LaunchQLProject> => {
  const workspace = new LaunchQLProject(fixture(['launchql']));
  await workspace.init();

  const moduleMap = workspace.getModuleMap();
  const meta = moduleMap[name];
  if (!meta) throw new Error(`Module ${name} not found in workspace`);

  const modPath = fixture(['launchql', meta.path]);
  const mod = new LaunchQLProject(modPath);
  await mod.init();
  return mod;
};

describe('sqitch modules', () => {
  it('should be able to create a plan', async () => {
    const mod = await getModuleProject('totp');
    const plan = await mod.generateModulePlan({ projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=totp
%uri=totp
procedures/generate_secret 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/generate_secret`)
    );
  });

  it('should be able to create a plan with cross-project requires already in', async () => {
    const mod = await getModuleProject('utils');
    const plan = await mod.generateModulePlan({ projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=utils
%uri=utils
projects/totp/procedures/generate_secret [totp:procedures/generate_secret] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add projects/totp/procedures/generate_secret
procedures/myfunction 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/myfunction`)
    );
  });

  it('should create a plan without options for projects and lose dependencies', async () => {
    const mod = await getModuleProject('secrets');
    const plan = await mod.generateModulePlan({ projects: false });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=secrets
%uri=secrets
procedures/secretfunction 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/secretfunction
`)
    );
  });

  it('should create a plan that references projects', async () => {
    const mod = await getModuleProject('secrets');
    const plan = await mod.generateModulePlan({ projects: true });
    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=secrets
%uri=secrets
procedures/secretfunction [totp:procedures/generate_secret pg-verify:procedures/verify_view] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/secretfunction
`)
    );
  });

  it('can create a module plan using workspace.generateModulePlan()', async () => {
    const mod = await getModuleProject('totp');
    const plan = await mod.generateModulePlan({ projects: false });
  
    expect(cleanText(plan)).toContain('%project=totp');
    expect(cleanText(plan)).toContain('procedures/generate_secret');
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('can create a module plan using workspace.generateModulePlan() w/projects', async () => {
    const mod = await getModuleProject('totp');
    const plan = await mod.generateModulePlan({ projects: true });
  
    expect(cleanText(plan)).toContain('%project=totp');
    expect(cleanText(plan)).toContain('procedures/generate_secret');
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('ensures plan includes all resolved deploy steps', async () => {
    const mod = await getModuleProject('secrets');
    const plan = await mod.generateModulePlan({ projects: false });
    expect(plan).toMatch(/add procedures\/secretfunction/);
    expect(cleanText(plan)).toMatchSnapshot();
  });
  
  it('ensures plan includes all resolved deploy steps w/projects', async () => {
    const mod = await getModuleProject('secrets');
    const plan = await mod.generateModulePlan({ projects: true });
    expect(plan).toMatch(/add procedures\/secretfunction/);
    expect(cleanText(plan)).toMatchSnapshot();
  });
  
  
});
