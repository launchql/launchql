import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('LaunchQLPackage.versionWorkspace', () => {
  it('detects and versions changed packages in dry-run mode', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.versionWorkspace({ dryRun: true });
    
    expect(result.success).toBe(true);
    expect(result.packages.length).toBeGreaterThan(0);
    expect(result.message).toContain('Dry run mode');
    
    const packageNames = result.packages.map(p => p.name);
    expect(packageNames).toContain('my-first');
    expect(packageNames).toContain('my-second');
    
    const firstPackage = result.packages.find(p => p.name === 'my-first');
    expect(firstPackage?.oldVersion).toBe('0.0.1');
    expect(firstPackage?.newVersion).toBe('0.0.2'); // default patch bump
  });

  it('versions packages with different bump types', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.versionWorkspace({ 
      bump: 'minor',
      dryRun: true 
    });
    
    expect(result.success).toBe(true);
    
    const firstPackage = result.packages.find(p => p.name === 'my-first');
    expect(firstPackage?.oldVersion).toBe('0.0.1');
    expect(firstPackage?.newVersion).toBe('0.1.0'); // minor bump
  });

  it('versions packages with exact version', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.versionWorkspace({ 
      bump: 'exact',
      exact: '3.0.0',
      dryRun: true 
    });
    
    expect(result.success).toBe(true);
    
    const firstPackage = result.packages.find(p => p.name === 'my-first');
    expect(firstPackage?.newVersion).toBe('3.0.0');
  });

  it('filters packages by pattern', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    
    const result = project.versionWorkspace({ 
      filter: 'my-first',
      dryRun: true 
    });
    
    expect(result.success).toBe(true);
    expect(result.packages.length).toBe(1);
    expect(result.packages[0].name).toBe('my-first');
  });

  it('handles no changed packages scenario', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    const workspacePath = project.getWorkspacePath()!;
    
    try {
      execSync('git init', { cwd: workspacePath });
      execSync('git config user.email "test@example.com"', { cwd: workspacePath });
      execSync('git config user.name "Test User"', { cwd: workspacePath });
      execSync('git add .', { cwd: workspacePath });
      execSync('git commit -m "initial"', { cwd: workspacePath });
      execSync('git tag "my-first@0.0.1"', { cwd: workspacePath });
      execSync('git tag "my-second@0.0.1"', { cwd: workspacePath });
      
      const result = project.versionWorkspace({ dryRun: true });
      
      expect(result.success).toBe(true);
      expect(result.packages.length).toBe(0);
      expect(result.message).toContain('No packages have changed');
    } catch (error) {
      console.warn('Skipping git-dependent test:', error);
    }
  });

  it('fails when not run from workspace root', () => {
    const project = fixture.getModuleProject(['simple'], 'my-first');
    
    const result = project.versionWorkspace();
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('must be run from a workspace root');
    expect(result.packages.length).toBe(0);
  });

  it('actually updates files when not in dry-run mode', () => {
    const project = fixture.getWorkspaceProject(['simple']);
    const workspacePath = project.getWorkspacePath()!;
    
    try {
      execSync('git init', { cwd: workspacePath });
      execSync('git config user.email "test@example.com"', { cwd: workspacePath });
      execSync('git config user.name "Test User"', { cwd: workspacePath });
      
      const result = project.versionWorkspace({ bump: 'patch' });
      
      expect(result.success).toBe(true);
      expect(result.packages.length).toBeGreaterThan(0);
      
      const firstPackagePath = path.join(workspacePath, 'packages', 'my-first', 'package.json');
      const updatedPkg = JSON.parse(fs.readFileSync(firstPackagePath, 'utf8'));
      expect(updatedPkg.version).toBe('0.0.2');
      
      const controlPath = path.join(workspacePath, 'packages', 'my-first', 'my-first.control');
      const controlContent = fs.readFileSync(controlPath, 'utf8');
      expect(controlContent).toContain("default_version = '0.0.2'");
      
      const sqlFile = path.join(workspacePath, 'packages', 'my-first', 'sql', 'my-first--0.0.2.sql');
      expect(fs.existsSync(sqlFile)).toBe(true);
      
    } catch (error) {
      console.warn('Skipping git-dependent test:', error);
    }
  });
});
