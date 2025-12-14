import fs from 'fs';
import path from 'path';
import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils/TestFixture';

describe('Remove Functionality', () => {
  let fixture: TestFixture;
  
  beforeEach(() => {
    fixture = new TestFixture('sqitch', 'simple-w-tags');
  });
  
  afterEach(() => {
    fixture.cleanup();
  });

  test('removes all changes from plan when removing from first change', async () => {
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
    expect(fs.existsSync(path.join(revertDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(revertDir, 'table_users.sql'))).toBe(true);
    expect(fs.existsSync(path.join(revertDir, 'table_products.sql'))).toBe(true);
    expect(fs.existsSync(path.join(verifyDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(verifyDir, 'table_users.sql'))).toBe(true);
    expect(fs.existsSync(path.join(verifyDir, 'table_products.sql'))).toBe(true);
    
    await pkg.removeFromPlan('schema_myfirstapp');
    
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

  test('removes changes from specified change to end when --to parameter is provided', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const originalPlan = fs.readFileSync(planPath, 'utf8');
    
    expect(originalPlan).toContain('schema_myfirstapp');
    expect(originalPlan).toContain('table_users');
    expect(originalPlan).toContain('table_products');
    
    await pkg.removeFromPlan('table_users');
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    expect(fs.existsSync(path.join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(deployDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(deployDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(revertDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(verifyDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'table_products.sql'))).toBe(false);
  });

  test('throws error when specified change does not exist', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    await expect(pkg.removeFromPlan('nonexistent_change')).rejects.toThrow(
      "Change 'nonexistent_change' not found in plan"
    );
  });

  test('handles empty plan gracefully', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    await pkg.removeFromPlan('schema_myfirstapp');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
    
    await expect(pkg.removeFromPlan('nonexistent_change')).rejects.toThrow(
      "Change 'nonexistent_change' not found in plan"
    );
  });

  test('removes associated tags when removing changes', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const originalPlan = fs.readFileSync(planPath, 'utf8');
    
    expect(originalPlan).toContain('@v1.0.0');
    expect(originalPlan).toContain('@v1.1.0');
    
    await pkg.removeFromPlan('table_users');
    
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('@v1.0.0');
    expect(updatedPlan).not.toContain('@v1.1.0');
  });

  test('removes tag and all subsequent changes and tags chronologically', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    let planContent = fs.readFileSync(planPath, 'utf8');
    
    expect(planContent).toContain('schema_myfirstapp');
    expect(planContent).toContain('table_users');
    expect(planContent).toContain('@v1.0.0');
    expect(planContent).toContain('table_products');
    expect(planContent).toContain('@v1.1.0');
    
    await pkg.removeFromPlan('@v1.0.0');
    
    planContent = fs.readFileSync(planPath, 'utf8');
    
    expect(planContent).toContain('schema_myfirstapp');
    
    expect(planContent).not.toContain('@v1.0.0');
    expect(planContent).not.toContain('table_users');
    expect(planContent).not.toContain('table_products');
    expect(planContent).not.toContain('@v1.1.0');
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    expect(fs.existsSync(path.join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(revertDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(verifyDir, 'schema_myfirstapp.sql'))).toBe(true);
    
    expect(fs.existsSync(path.join(deployDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(deployDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(revertDir, 'table_products.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'table_users.sql'))).toBe(false);
    expect(fs.existsSync(path.join(verifyDir, 'table_products.sql'))).toBe(false);
  });

  test('removes a specific tag when its associated change is removed', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    let planContent = fs.readFileSync(planPath, 'utf8');
    expect(planContent).toContain('@v1.0.0');
    await pkg.removeFromPlan('schema_myfirstapp');
    planContent = fs.readFileSync(planPath, 'utf8');
    expect(planContent).not.toContain('@v1.0.0');
  });
  test('removes a specific tag when its tag is passed in as toChange parameter', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    let planContent = fs.readFileSync(planPath, 'utf8');
    expect(planContent).toContain('@v1.0.0');
    expect(planContent).toContain('table_users');
    expect(planContent).toContain('table_products');
    expect(planContent).toContain('@v1.1.0');
    
    await pkg.removeFromPlan('@v1.0.0');
    
    planContent = fs.readFileSync(planPath, 'utf8');
    expect(planContent).not.toContain('@v1.0.0');
    expect(planContent).not.toContain('table_users'); // Should be removed as it's the change the tag is associated with
    expect(planContent).not.toContain('table_products'); // Should be removed as it comes after the tag
    expect(planContent).not.toContain('@v1.1.0'); // Should be removed as it comes after the tag
    expect(planContent).toContain('schema_myfirstapp'); // Should remain as it comes before the tag
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    expect(fs.existsSync(path.join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(fs.existsSync(path.join(deployDir, 'table_users.sql'))).toBe(false); // Should be deleted
    expect(fs.existsSync(path.join(deployDir, 'table_products.sql'))).toBe(false); // Should be deleted
    expect(fs.existsSync(path.join(revertDir, 'table_users.sql'))).toBe(false); // Should be deleted
    expect(fs.existsSync(path.join(revertDir, 'table_products.sql'))).toBe(false); // Should be deleted
    expect(fs.existsSync(path.join(verifyDir, 'table_users.sql'))).toBe(false); // Should be deleted
    expect(fs.existsSync(path.join(verifyDir, 'table_products.sql'))).toBe(false); // Should be deleted
  });


  test('handles missing SQL files gracefully', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    const deployDir = path.join(pkg.getModulePath()!, 'deploy');
    const revertDir = path.join(pkg.getModulePath()!, 'revert');
    const verifyDir = path.join(pkg.getModulePath()!, 'verify');
    
    fs.unlinkSync(path.join(deployDir, 'table_users.sql'));
    fs.unlinkSync(path.join(revertDir, 'table_products.sql'));
    fs.unlinkSync(path.join(verifyDir, 'schema_myfirstapp.sql'));
    
    await expect(pkg.removeFromPlan('schema_myfirstapp')).resolves.not.toThrow();
    
    const planPath = path.join(pkg.getModulePath()!, 'pgpm.plan');
    const updatedPlan = fs.readFileSync(planPath, 'utf8');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
  });

  test('requires toChange parameter to be provided', async () => {
    const pkg = fixture.getModuleProject([], 'my-first');
    
    // @ts-expect-error Testing runtime behavior when parameter is missing
    await expect(() => pkg.removeFromPlan()).rejects.toThrow();
  });

});
