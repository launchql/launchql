import { cleanText, TestFixture } from '../../../test-utils';

describe('stage fixture plan generation (unique-names)', () => {
  let fixture: TestFixture;

  beforeAll(() => {
    fixture = new TestFixture('stage');
  });

  afterAll(() => {
    fixture.cleanup();
  });

  it('generates a plan for unique-names (no packages)', async () => {
    const mod = fixture.getModuleProject([], 'unique-names');
    const plan = mod.generateModulePlan({ includePackages: false });
    expect(cleanText(plan)).toMatchSnapshot();
  });

  it('generates a plan for unique-names (with packages)', async () => {
    const mod = fixture.getModuleProject([], 'unique-names');
    const plan = mod.generateModulePlan({ includePackages: true });
    expect(cleanText(plan)).toMatchSnapshot();
  });
  it('generates a plan for unique-names (with packages and includeTags)', async () => {
    const mod = fixture.getModuleProject([], 'unique-names');
    const plan = mod.generateModulePlan({ includePackages: true, includeTags: true });
    expect(cleanText(plan)).toMatchSnapshot();
  });

});
