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

  it('detects missing control file when renamed away', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const controlPath = path.join(modPath, 'my-first.control');
    const wrongControlPath = path.join(modPath, 'not-my-first.control');

    fs.renameSync(controlPath, wrongControlPath);
    try {
      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('missing_control');
    } finally {
      if (fs.existsSync(wrongControlPath)) {
        fs.renameSync(wrongControlPath, controlPath);
      }
    }
  });
});
