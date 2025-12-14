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

describe('PgpmPackage.renameModule', () => {
  it('performs dry-run rename and reports changed files/warnings', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const res = project.renameModule('renamed_mod', { dryRun: true });

    expect(Array.isArray(res.changed)).toBe(true);
    expect(res.changed.find(f => f.endsWith('pgpm.plan'))).toBeTruthy();
    expect(res.changed.find(f => f.endsWith('Makefile'))).toBeTruthy();
    expect(res.changed.find(f => f.endsWith('renamed_mod.control'))).toBeTruthy();

    expect(Array.isArray(res.warnings)).toBe(true);
    expect(res.warnings.find(w => /combined sql/i.test(w))).toBeTruthy();
  });

  it('renames plan/control/makefile and Analyze reports no name mismatches', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;

    const res = project.renameModule('renamed_mod', { dryRun: false, syncPackageJsonName: false });
    expect(res.changed.length).toBeGreaterThan(0);

    const newControl = path.join(modPath, 'renamed_mod.control');
    expect(fs.existsSync(newControl)).toBe(true);

    const analysis = project.analyzeModule();
    const mismatchCodes = analysis.issues.filter(i =>
      i.code === 'plan_project_mismatch' || i.code === 'plan_uri_mismatch' || i.code === 'control_filename_mismatch'
    );
    expect(mismatchCodes.length).toBe(0);
  });
});
