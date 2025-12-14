import fs from 'fs';
import path from 'path';
import { TestFixture } from '../../test-utils';
import { parsePlanFile } from '../../src/files/plan/parser';
import { writePlanFile } from '../../src/files/plan/writer';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('PgpmPackage.analyzeModule', () => {
  it('reports issues for a basic fixture (e.g. missing combined SQL)', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const result = project.analyzeModule();

    expect(result.name).toBe('my-first');
    expect(result.ok).toBe(false);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('missing_sql');
    expect(result.issues.find(i => i.code === 'missing_sql')?.file).toContain(`sql/my-first--`);
  });

  it('reports OK when combined SQL exists and names align', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const pkgJson = JSON.parse(fs.readFileSync(path.join(modPath, 'package.json'), 'utf8'));
    const version = pkgJson.version;
    const sqlDir = path.join(modPath, 'sql');
    const combined = path.join(sqlDir, `my-first--${version}.sql`);
    fs.mkdirSync(sqlDir, { recursive: true });
    fs.writeFileSync(combined, '-- combined sql');

    const result = project.analyzeModule();
    expect(result.ok).toBe(true);
    expect(result.issues.length).toBe(0);
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

  it('detects Makefile EXTENSION mismatch', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const makefilePath = path.join(modPath, 'Makefile');
    const original = fs.readFileSync(makefilePath, 'utf8');
    try {
      const mutated = original.replace(/^EXTENSION\s*=.*$/m, 'EXTENSION = wrongname');
      fs.writeFileSync(makefilePath, mutated);
      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('makefile_extension_mismatch');
    } finally {
      fs.writeFileSync(makefilePath, original);
    }
  });

  it('detects Makefile DATA mismatch', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const makefilePath = path.join(modPath, 'Makefile');
    const original = fs.readFileSync(makefilePath, 'utf8');
    try {
      const mutated = original.replace(/^DATA\s*=.*$/m, 'DATA = sql/wrong--0.0.0.sql');
      fs.writeFileSync(makefilePath, mutated);
      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('makefile_data_mismatch');
    } finally {
      fs.writeFileSync(makefilePath, original);
    }
  });

  it('detects plan %uri mismatch', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const planPath = path.join(modPath, 'pgpm.plan');
    const original = fs.readFileSync(planPath, 'utf8');
    try {
      const parsed = parsePlanFile(planPath);
      if (!parsed.data) throw new Error('Failed to parse plan');
      parsed.data.uri = 'different-uri';
      writePlanFile(planPath, parsed.data);
      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('plan_uri_mismatch');
    } finally {
      fs.writeFileSync(planPath, original);
    }
  });

  it('detects missing deploy/revert/verify directories', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;

    const deployDir = path.join(modPath, 'deploy');
    const revertDir = path.join(modPath, 'revert');
    const verifyDir = path.join(modPath, 'verify');

    const tmpDeploy = path.join(modPath, '_deploy_bak');
    const tmpRevert = path.join(modPath, '_revert_bak');
    const tmpVerify = path.join(modPath, '_verify_bak');

    fs.renameSync(deployDir, tmpDeploy);
    fs.renameSync(revertDir, tmpRevert);
    fs.renameSync(verifyDir, tmpVerify);

    try {
      const result = project.analyzeModule();
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('missing_deploy_dir');
      expect(codes).toContain('missing_revert_dir');
      expect(codes).toContain('missing_verify_dir');
    } finally {
      if (fs.existsSync(tmpDeploy)) fs.renameSync(tmpDeploy, deployDir);
      if (fs.existsSync(tmpRevert)) fs.renameSync(tmpRevert, revertDir);
      if (fs.existsSync(tmpVerify)) fs.renameSync(tmpVerify, verifyDir);
    }
  });
});
