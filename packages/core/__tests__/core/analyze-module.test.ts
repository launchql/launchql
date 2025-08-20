import fs from 'fs';
import path from 'path';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('LaunchQLPackage.analyzeModule', () => {
  it('reports issues for a basic fixture (e.g. missing combined SQL)', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const result = project.analyzeModule();

    expect(result.name).toBe('my-first');
    expect(result.ok).toBe(false);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('missing_sql');
    expect(result.issues.find(i => i.code === 'missing_sql')?.file).toContain(`sql/my-first--`);
  });

  it('detects plan project name mismatch', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const planPath = path.join(modPath, 'launchql.plan');

    const original = fs.readFileSync(planPath, 'utf8');
    try {
      const mutated = original.replace(/^%project\s*=\s*my-first/m, '%project = different-name');
      fs.writeFileSync(planPath, mutated);

      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('plan_project_mismatch');
    } finally {
      fs.writeFileSync(planPath, original);
    }
  });
});
