import fs from 'fs';
import path from 'path';
import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils/TestFixture';
import { parsePlanFile } from '../../src/files/plan/parser';

describe('Clear Functionality', () => {
  let fixture: TestFixture;
  
  beforeEach(() => {
    fixture = new TestFixture('sqitch', 'simple-w-tags');
  });
  
  afterEach(() => {
    fixture.cleanup();
  });

  test('clears all changes from plan when plan has changes', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const originalPlan = fs.readFileSync(planPath, 'utf8');
    
    expect(originalPlan).toContain('schema_myfirstapp');
    expect(originalPlan).toContain('table_users');
    expect(originalPlan).toContain('table_products');
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    expect(fs.existsSync(path.join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(deployDir, 'table_users.sql'))).toBe(true);
    expect(fs.existsSync(path.join(deployDir, 'table_products.sql'))).toBe(true);
    
    const result = parsePlanFile(planPath);
    expect(result.errors.length).toBe(0);
    const plan = result.data!;
    expect(plan.changes.length).toBe(3);
    
    const firstChange = plan.changes[0].name;
    expect(firstChange).toBe('schema_myfirstapp');
    
    await pkg.removeFromPlan(firstChange);
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
    
    expect(fs.existsSync(path.join(deployDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(fs.existsSync(path.join(deployDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(deployDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'table_products.sql'))).toBe(false);
  });

  test('handles empty plan gracefully', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    
    await pkg.removeFromPlan('schema_myfirstapp');
    
    const result = parsePlanFile(planPath);
    expect(result.errors.length).toBe(0);
    const plan = result.data!;
    expect(plan.changes.length).toBe(0);
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
  });

  test('identifies first change correctly from plan file', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const result = parsePlanFile(planPath);
    
    expect(result.errors.length).toBe(0);
    const plan = result.data!;
    expect(plan.changes.length).toBeGreaterThan(0);
    
    const firstChange = plan.changes[0].name;
    expect(firstChange).toBe('schema_myfirstapp');
    
    const secondChange = plan.changes[1].name;
    expect(secondChange).toBe('table_users');
    
    const thirdChange = plan.changes[2].name;
    expect(thirdChange).toBe('table_products');
  });

  test('removes all associated tags when clearing plan', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const originalPlan = fs.readFileSync(planPath, 'utf8');
    
    expect(originalPlan).toContain('@v1.0.0');
    expect(originalPlan).toContain('@v1.1.0');
    
    const result = parsePlanFile(planPath);
    const plan = result.data!;
    const firstChange = plan.changes[0].name;
    
    await pkg.removeFromPlan(firstChange);
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('@v1.0.0');
    expect(updatedPlan).not.toContain('@v1.1.0');
  });

  test('handles missing SQL files gracefully during clear', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    fs.unlinkSync(path.join(deployDir, 'table_users.sql'));
    fs.unlinkSync(path.join(revertDir, 'table_products.sql'));
    fs.unlinkSync(path.join(verifyDir, 'schema_myfirstapp.sql'));
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const result = parsePlanFile(planPath);
    const plan = result.data!;
    const firstChange = plan.changes[0].name;
    
    await expect(pkg.removeFromPlan(firstChange)).resolves.not.toThrow();
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
  });
});
