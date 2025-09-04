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

describe('LaunchQLPackage.validateModule', () => {
  it('validates a consistent package successfully', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const pkgJson = JSON.parse(fs.readFileSync(path.join(modPath, 'package.json'), 'utf8'));
    const version = pkgJson.version;
    const sqlDir = path.join(modPath, 'sql');
    const sqlFile = path.join(sqlDir, `${info.extname}--${version}.sql`);
    
    fs.mkdirSync(sqlDir, { recursive: true });
    fs.writeFileSync(sqlFile, '-- combined sql');

    const result = project.validateModule();
    
    expect(result.ok).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('detects version mismatch between package.json and control file', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const pkgJsonPath = path.join(modPath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '2.0.0';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const result = project.validateModule();
    
    expect(result.ok).toBe(false);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('version_mismatch');
    
    const versionIssue = result.issues.find(i => i.code === 'version_mismatch');
    expect(versionIssue?.message).toContain('0.0.1');
    expect(versionIssue?.message).toContain('2.0.0');
  });

  it('detects missing SQL migration file', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    
    const result = project.validateModule();
    
    expect(result.ok).toBe(false);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('missing_sql_migration');
    
    const sqlIssue = result.issues.find(i => i.code === 'missing_sql_migration');
    expect(sqlIssue?.message).toContain('my-first--0.0.1.sql');
  });

  it('detects missing package.json', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const pkgJsonPath = path.join(modPath, 'package.json');
    const backupPath = path.join(modPath, 'package.json.bak');
    
    fs.renameSync(pkgJsonPath, backupPath);
    
    try {
      const result = project.validateModule();
      
      expect(result.ok).toBe(false);
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('missing_package_json');
    } finally {
      fs.renameSync(backupPath, pkgJsonPath);
    }
  });

  it('detects missing version in package.json', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const pkgJsonPath = path.join(modPath, 'package.json');
    
    const original = fs.readFileSync(pkgJsonPath, 'utf8');
    const pkgJson = JSON.parse(original);
    delete pkgJson.version;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    
    try {
      const result = project.validateModule();
      
      expect(result.ok).toBe(false);
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('missing_version');
    } finally {
      fs.writeFileSync(pkgJsonPath, original);
    }
  });

  it('fails when not run in a module directory', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.validateModule();
    
    expect(result.ok).toBe(false);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('not_in_module');
  });

  it('warns about missing version tag in plan file', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const pkgJson = JSON.parse(fs.readFileSync(path.join(modPath, 'package.json'), 'utf8'));
    const version = pkgJson.version;
    const sqlDir = path.join(modPath, 'sql');
    const sqlFile = path.join(sqlDir, `${info.extname}--${version}.sql`);
    
    fs.mkdirSync(sqlDir, { recursive: true });
    fs.writeFileSync(sqlFile, '-- combined sql');

    const result = project.validateModule();
    
    expect(result.ok).toBe(true);
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('missing_version_tag');
  });
});
