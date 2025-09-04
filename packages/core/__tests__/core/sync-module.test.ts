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

describe('LaunchQLPackage.syncModule', () => {
  it('syncs module artifacts with package.json version', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const result = project.syncModule();
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('0.0.1');
    expect(result.files.length).toBeGreaterThan(0);
    
    const controlContent = fs.readFileSync(info.controlFile, 'utf8');
    expect(controlContent).toContain("default_version = '0.0.1'");
    
    const sqlFile = path.join(modPath, 'sql', `${info.extname}--0.0.1.sql`);
    expect(fs.existsSync(sqlFile)).toBe(true);
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    expect(sqlContent).toContain('my-first extension version 0.0.1');
  });

  it('syncs with explicit version parameter', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const result = project.syncModule('2.5.0');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('2.5.0');
    
    const controlContent = fs.readFileSync(info.controlFile, 'utf8');
    expect(controlContent).toContain("default_version = '2.5.0'");
    
    const sqlFile = path.join(modPath, 'sql', `${info.extname}--2.5.0.sql`);
    expect(fs.existsSync(sqlFile)).toBe(true);
  });

  it('does not overwrite existing SQL migration files', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const sqlDir = path.join(modPath, 'sql');
    const sqlFile = path.join(sqlDir, `${info.extname}--0.0.1.sql`);
    fs.mkdirSync(sqlDir, { recursive: true });
    fs.writeFileSync(sqlFile, '-- custom existing content');
    
    const result = project.syncModule();
    
    expect(result.success).toBe(true);
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    expect(sqlContent).toBe('-- custom existing content');
  });

  it('fails when not run in a module directory', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.syncModule();
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('must be run inside a LaunchQL module');
    expect(result.files.length).toBe(0);
  });

  it('fails when package.json is missing', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const pkgJsonPath = path.join(modPath, 'package.json');
    const backupPath = path.join(modPath, 'package.json.bak');
    
    fs.renameSync(pkgJsonPath, backupPath);
    
    try {
      const result = project.syncModule();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('package.json not found');
    } finally {
      fs.renameSync(backupPath, pkgJsonPath);
    }
  });

  it('fails when package.json lacks version', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    const modPath = project.getModulePath()!;
    const pkgJsonPath = path.join(modPath, 'package.json');
    
    const original = fs.readFileSync(pkgJsonPath, 'utf8');
    const pkgJson = JSON.parse(original);
    delete pkgJson.version;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    
    try {
      const result = project.syncModule();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('No version found in package.json');
    } finally {
      fs.writeFileSync(pkgJsonPath, original);
    }
  });
});
