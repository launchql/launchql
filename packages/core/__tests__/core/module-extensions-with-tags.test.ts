import { cleanText, TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('getModuleExtensions for my-first', () => {
  const project = fixture.getModuleProject(['simple-w-tags'], 'my-first');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleExtensions for my-second', () => {
  const project = fixture.getModuleProject(['simple-w-tags'], 'my-second');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleExtensions for my-third', () => {
  const project = fixture.getModuleProject(['simple-w-tags'], 'my-third');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleDependencies for my-third', () => {
  const project = fixture.getModuleProject(['simple-w-tags'], 'my-third');

  //   console.log(project.getAvailableModules());
  //   console.log(project.getModuleMap());
  //   console.log(project.getModuleExtensions());

  expect(project.getModuleDependencies('my-third')).toMatchSnapshot();
});

describe('generateModulePlan with tags', () => {
  it('generates plan for my-first', () => {
    const project = fixture.getModuleProject(['simple-w-tags'], 'my-first');
    const plan = project.generateModulePlan({ includePackages: false });
    
    // The generateModulePlan method generates from SQL files, not from existing plan
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('generates plan for my-second with cross-project dependencies', () => {
    const project = fixture.getModuleProject(['simple-w-tags'], 'my-second');
    const plan = project.generateModulePlan({ includePackages: true });
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('generates plan for my-third with multiple cross-project dependencies', () => {
    const project = fixture.getModuleProject(['simple-w-tags'], 'my-third');
    const plan = project.generateModulePlan({ includePackages: true });
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('generates plan without projects flag loses cross-project dependencies', () => {
    const project = fixture.getModuleProject(['simple-w-tags'], 'my-second');
    const plan = project.generateModulePlan({ includePackages: false });
    
    // Should not contain cross-project dependencies when projects: false
    // expect(cleanText(plan)).not.toContain('my-first:');
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('reads existing plan file with tags', () => {
    const project = fixture.getModuleProject(['simple-w-tags'], 'my-first');
    const plan = project.getModulePlan();
    
    // The getModulePlan method reads the existing plan file
    expect(plan).toContain('@v1.0.0');
    expect(plan).toContain('@v1.1.0');
    expect(plan).toMatchSnapshot();
  });
});
