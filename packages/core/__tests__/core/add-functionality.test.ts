import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

describe('Add functionality', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = new TestFixture();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  const setupModule = (moduleDir: string) => {
    mkdirSync(moduleDir, { recursive: true });
    mkdirSync(join(moduleDir, 'deploy'), { recursive: true });
    mkdirSync(join(moduleDir, 'revert'), { recursive: true });
    mkdirSync(join(moduleDir, 'verify'), { recursive: true });
    
    const planContent = `%syntax-version=1.0.0
%project=test-module
%uri=https://github.com/test/test-module

`;
    writeFileSync(join(moduleDir, 'pgpm.plan'), planContent);
    
    const controlContent = `{
  "name": "test-module",
  "version": "0.1.0",
  "description": "Test module"
}`;
    writeFileSync(join(moduleDir, 'launchql.control'), controlContent);
  };

  test('addChange creates change in plan file and SQL files', () => {
    const moduleDir = join(fixture.tempDir, 'test-module');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    pkg.addChange('organizations');
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('organizations');
    
    expect(fs.existsSync(join(moduleDir, 'deploy', 'organizations.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'revert', 'organizations.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'verify', 'organizations.sql'))).toBe(true);
  });

  test('addChange with dependencies validates and includes them', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-deps');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('users');
    
    pkg.addChange('contacts', ['users'], 'Adds contacts table');
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('users');
    expect(planContent).toContain('contacts');
    expect(planContent).toContain('Adds contacts table');
    
    const deployContent = readFileSync(join(moduleDir, 'deploy', 'contacts.sql'), 'utf8');
    expect(deployContent).toContain('requires: users');
  });

  test('addChange with nested path creates directories', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-nested');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    pkg.addChange('api/v1/endpoints');
    
    expect(fs.existsSync(join(moduleDir, 'deploy', 'api', 'v1', 'endpoints.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'revert', 'api', 'v1', 'endpoints.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'verify', 'api', 'v1', 'endpoints.sql'))).toBe(true);
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('api/v1/endpoints');
  });

  test('addChange with deeply nested path creates directories', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-deep-nested');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    pkg.addChange('schema/myschema/tables/mytable');
    
    expect(fs.existsSync(join(moduleDir, 'deploy', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'revert', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);
    expect(fs.existsSync(join(moduleDir, 'verify', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('schema/myschema/tables/mytable');
  });

  test('addChange validates change name', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-validation');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    expect(() => pkg.addChange('')).toThrow('Change name is required');
    expect(() => pkg.addChange('   ')).toThrow('Change name is required');
    
    expect(() => pkg.addChange('invalid name with spaces')).toThrow();
  });

  test('addChange prevents duplicate changes', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-duplicates');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('organizations');
    
    expect(() => pkg.addChange('organizations')).toThrow("Change 'organizations' already exists in plan");
  });

  test('addChange validates dependencies exist', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-dep-validation');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    expect(() => pkg.addChange('contacts', ['nonexistent'])).toThrow("Dependency 'nonexistent' not found in plan");
  });

  test('addChange requires module context', () => {
    const nonModuleDir = join(fixture.tempDir, 'not-a-module');
    mkdirSync(nonModuleDir, { recursive: true });
    
    const pkg = new PgpmPackage(nonModuleDir);
    
    expect(() => pkg.addChange('organizations')).toThrow('This command must be run inside a PGPM workspace or module');
  });

  test('addChange creates SQL files without transaction statements', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-no-transactions');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    pkg.addChange('no-transactions');
    
    const deployContent = readFileSync(join(moduleDir, 'deploy', 'no-transactions.sql'), 'utf8');
    const revertContent = readFileSync(join(moduleDir, 'revert', 'no-transactions.sql'), 'utf8');
    const verifyContent = readFileSync(join(moduleDir, 'verify', 'no-transactions.sql'), 'utf8');
    
    expect(deployContent).not.toContain('BEGIN;');
    expect(deployContent).not.toContain('COMMIT;');
    expect(deployContent).not.toContain('ROLLBACK;');
    
    expect(revertContent).not.toContain('BEGIN;');
    expect(revertContent).not.toContain('COMMIT;');
    expect(revertContent).not.toContain('ROLLBACK;');
    
    expect(verifyContent).not.toContain('BEGIN;');
    expect(verifyContent).not.toContain('COMMIT;');
    expect(verifyContent).not.toContain('ROLLBACK;');
  });

  test('addChange includes proper headers and comments in SQL files', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-headers');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('users');
    
    pkg.addChange('test-headers', ['users'], 'Test change with headers');
    
    const deployContent = readFileSync(join(moduleDir, 'deploy', 'test-headers.sql'), 'utf8');
    const revertContent = readFileSync(join(moduleDir, 'revert', 'test-headers.sql'), 'utf8');
    const verifyContent = readFileSync(join(moduleDir, 'verify', 'test-headers.sql'), 'utf8');
    
    expect(deployContent).toContain('-- Deploy: test-headers');
    expect(deployContent).toContain('-- made with <3 @ constructive.io');
    expect(deployContent).toContain('-- requires: users');
    expect(deployContent).toContain('-- Add your deployment SQL here');
    
    expect(revertContent).toContain('-- Revert: test-headers');
    expect(revertContent).toContain('-- Add your revert SQL here');
    
    expect(verifyContent).toContain('-- Verify: test-headers');
    expect(verifyContent).toContain('-- Add your verification SQL here');
  });

  test('addChange handles multiple dependencies', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-multi-deps');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('users');
    pkg.addChange('roles');
    pkg.addChange('permissions');
    
    pkg.addChange('user-permissions', ['users', 'roles', 'permissions'], 'Links users to permissions');
    
    const deployContent = readFileSync(join(moduleDir, 'deploy', 'user-permissions.sql'), 'utf8');
    expect(deployContent).toContain('-- requires: users');
    expect(deployContent).toContain('-- requires: roles');
    expect(deployContent).toContain('-- requires: permissions');
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('user-permissions');
    expect(planContent).toContain('Links users to permissions');
  });

  test('addChange allows cross-module dependencies', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-cross-deps');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('adoption-history', ['pets:tables/pets'], 'Adds adoption history table');
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('adoption-history');
    expect(planContent).toContain('[pets:tables/pets]');
    
    const deployContent = readFileSync(join(moduleDir, 'deploy', 'adoption-history.sql'), 'utf8');
    expect(deployContent).toContain('-- requires: pets:tables/pets');
  });

  test('addChange validates local dependencies but not cross-module ones', () => {
    const moduleDir = join(fixture.tempDir, 'test-module-mixed-deps');
    setupModule(moduleDir);
    
    const pkg = new PgpmPackage(moduleDir);
    
    pkg.addChange('users');
    
    expect(() => pkg.addChange('contacts', ['nonexistent', 'pets:tables/pets'])).toThrow("Dependency 'nonexistent' not found in plan");
    
    pkg.addChange('contacts', ['users', 'pets:tables/pets'], 'Mixed local and cross-module deps');
    
    const planContent = readFileSync(join(moduleDir, 'pgpm.plan'), 'utf8');
    expect(planContent).toContain('contacts');
    expect(planContent).toContain('[users pets:tables/pets]');
  });
});
