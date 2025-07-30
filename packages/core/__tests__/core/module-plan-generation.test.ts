import { cleanText, TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('sqitch modules', () => {
  it('should be able to create a plan', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'totp');
    const plan = mod.generateModulePlan({ packages: false });

    expect(cleanText(plan)).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=totp
%uri=totp
procedures/generate_secret 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/generate_secret`)
    );
  });

  it('should be able to create a plan with cross-project requires already in', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'utils');
    const plan = mod.generateModulePlan({ packages: true });

    expect(cleanText(plan)).toMatchSnapshot();
    expect(plan).toEqual(
      cleanText(`
%syntax-version=1.0.0
%project=utils
%uri=utils
procedures/myfunction [totp:procedures/generate_secret pg-verify:procedures/verify_view] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add procedures/myfunction`)
    );
  });

  it('should create a plan without options for projects and lose dependencies', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'secrets');
    const plan = mod.generateModulePlan({ packages: false });

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
    const mod = fixture.getModuleProject(['launchql'], 'secrets');
    const plan = mod.generateModulePlan({ packages: true });

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
    const mod = fixture.getModuleProject(['launchql'], 'totp');
    const plan = mod.generateModulePlan({ packages: false });

    expect(cleanText(plan)).toContain('%project=totp');
    expect(cleanText(plan)).toContain('procedures/generate_secret');
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('can create a module plan using workspace.generateModulePlan() w/projects', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'totp');
    const plan = mod.generateModulePlan({ packages: true });

    expect(cleanText(plan)).toContain('%project=totp');
    expect(cleanText(plan)).toContain('procedures/generate_secret');
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('ensures plan includes all resolved deploy steps', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'secrets');
    const plan = mod.generateModulePlan({ packages: false });

    expect(plan).toMatch(/add procedures\/secretfunction/);
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('ensures plan includes all resolved deploy steps w/projects', async () => {
    const mod = fixture.getModuleProject(['launchql'], 'secrets');
    const plan = mod.generateModulePlan({ packages: true });

    expect(plan).toMatch(/add procedures\/secretfunction/);
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('ensures simple plan', async () => {
    const mod = fixture.getModuleProject(['simple'], 'my-first');
    const plan = mod.generateModulePlan({ packages: true });

    expect(plan).toMatchSnapshot();
  });
});
