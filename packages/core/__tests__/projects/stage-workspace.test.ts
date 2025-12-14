import { PgpmPackage, PackageContext } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils/TestFixture';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

describe('Staging Fixture Tests', () => {
  let fixture: TestFixture;
  let deployFixture: CoreDeployTestFixture;
  let db: TestDatabase;

  beforeAll(() => {
    fixture = new TestFixture('stage');
  });

  afterAll(() => {
    fixture.cleanup();
  });

  describe('Workspace Detection', () => {
    it('detects staging fixture as workspace correctly', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      expect(project.getContext()).toBe(PackageContext.Workspace);
      expect(project.isInWorkspace()).toBe(true);
      expect(project.isInModule()).toBe(false);
    });

    it('discovers all modules in workspace', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const modules = await project.getModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
      
      const moduleNames = modules.map(m => m.getModuleName());
      expect(moduleNames).toContain('unique-names');
      expect(moduleNames.some(name => name.includes('launchql-uuid'))).toBe(true);
    });
  });

  describe('Module Discovery', () => {
    it('returns available modules from both extensions and packages', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);
      
      const availableModules = project.getAvailableModules();
      expect(Array.isArray(availableModules)).toBe(true);
      expect(availableModules.length).toBeGreaterThan(0);
      expect(availableModules).toContain('unique-names');
    });

    it('getModules() returns all modules from extensions/@pgpm and packages', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const modules = await project.getModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);

      const moduleNames = modules.map(m => m.getModuleName());

      expect(moduleNames).toContain('unique-names');

      expect(moduleNames.some(name => name.includes('launchql-uuid'))).toBe(true);
      expect(moduleNames.some(name => name.includes('launchql-base32'))).toBe(true);

      expect(moduleNames.some(name => name.includes('db-meta'))).toBe(true);

      modules.forEach(mod => {
        expect(mod.isInModule()).toBe(true);
        expect(mod.getContext()).toBe(PackageContext.ModuleInsideWorkspace);
      });
    });

    it('verifies module metadata and paths are correctly resolved', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const modules = await project.getModules();
      const moduleMap = project.getModuleMap();
      
      expect(Object.keys(moduleMap).length).toBeGreaterThan(0);
      
      expect(moduleMap['unique-names']).toBeDefined();
      expect(moduleMap['unique-names'].path).toContain('packages/unique-names');
      
      modules.forEach(mod => {
        const moduleName = mod.getModuleName();
        const moduleInfo = moduleMap[moduleName];
        expect(moduleInfo).toBeDefined();
        expect(moduleInfo.path).toBeTruthy();
      });
    });

    it('detects module inside workspace correctly', async () => {
      const cwd = fixture.getFixturePath('packages', 'unique-names');
      const project = new PgpmPackage(cwd);

      expect(project.getContext()).toBe(PackageContext.ModuleInsideWorkspace);
      expect(project.isInWorkspace()).toBe(false);
      expect(project.isInModule()).toBe(true);
    });

    it('resolves module name from launchql plan', async () => {
      const cwd = fixture.getFixturePath('packages', 'unique-names');
      const project = new PgpmPackage(cwd);

      const name = project.getModuleName();
      expect(typeof name).toBe('string');
      expect(name).toBe('unique-names');
    });
  });

  describe('Extension Module Detection', () => {
    it('detects extension modules correctly', async () => {
      const cwd = fixture.getFixturePath('extensions', '@pgpm', 'uuid');
      const project = new PgpmPackage(cwd);

      expect(project.getContext()).toBe(PackageContext.ModuleInsideWorkspace);
      expect(project.isInModule()).toBe(true);
      
      const name = project.getModuleName();
      expect(name).toBe('launchql-uuid');
    });

    it('gets module info with version and paths for extensions', async () => {
      const cwd = fixture.getFixturePath('extensions', '@pgpm', 'uuid');
      const project = new PgpmPackage(cwd);

      const info = project.getModuleInfo();
      expect(info.extname).toBeTruthy();
      expect(info.version).toMatch(/\d+\.\d+\.\d+/);
      expect(info.controlFile).toContain('.control');
    });
  });

  describe('Module Dependencies', () => {
    it('gets required modules from control file', async () => {
      const cwd = fixture.getFixturePath('packages', 'unique-names');
      const project = new PgpmPackage(cwd);

      const deps = project.getRequiredModules();
      expect(Array.isArray(deps)).toBe(true);
      expect(deps).toContain('plpgsql');
    });

    it('gets module dependencies for workspace modules', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const { native, modules: deps } = project.getModuleDependencies('unique-names');
      expect(native).toBeDefined();
      expect(deps).toBeDefined();
      expect(Array.isArray(deps)).toBe(true);
    });

    it('gets dependency changes with versions for internal modules', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);
      
      const result = await project.getModuleDependencyChanges('unique-names');
      expect(result).toHaveProperty('native');
      expect(result).toHaveProperty('modules');
      expect(Array.isArray(result.modules)).toBe(true);
    });
  });

  describe('Dependency Resolution', () => {
    it('resolves module dependencies correctly from pgpm.plan files', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const { native, modules: deps } = project.getModuleDependencies('unique-names');

      expect(Array.isArray(deps)).toBe(true);
      expect(deps.some(dep => dep.includes('launchql-default-roles'))).toBe(true);
      expect(deps.some(dep => dep.includes('launchql-defaults'))).toBe(true);
      expect(deps.some(dep => dep.includes('launchql-verify'))).toBe(true);
    });

    it('verifies cross-module dependencies work between extensions', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const uuidDeps = project.getModuleDependencies('launchql-uuid');
      expect(uuidDeps.modules).toBeDefined();
      expect(Array.isArray(uuidDeps.modules)).toBe(true);
      
      const result = await project.getModuleDependencyChanges('launchql-uuid');
      expect(result.modules).toBeDefined();
      expect(Array.isArray(result.modules)).toBe(true);
    });

    it('tests dependency chain resolution for complex dependencies', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const result = await project.getModuleDependencyChanges('unique-names');
      
      expect(result.modules.length).toBeGreaterThan(0);
      
      const dependencyNames = result.modules.map(dep => dep.name);
      expect(dependencyNames.some(name => name.includes('launchql-default-roles'))).toBe(true);
      
      result.modules.forEach(dep => {
        expect(dep).toHaveProperty('name');
        expect(dep).toHaveProperty('latest');
        expect(dep).toHaveProperty('version');
        expect(typeof dep.name).toBe('string');
        expect(typeof dep.latest).toBe('string');
        expect(typeof dep.version).toBe('string');
      });
    });

    it('resolves dependencies with version tags correctly', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const { native, modules: deps } = project.getModuleDependencies('unique-names');
      
      const dependencyChanges = await project.getModuleDependencyChanges('unique-names');

      const defaultRolesDep = dependencyChanges.modules.find(dep =>
        dep.name.includes('launchql-default-roles')
      );
      
      if (defaultRolesDep) {
        expect(defaultRolesDep.name).toBeTruthy();
        expect(defaultRolesDep.latest).toBeTruthy();
        expect(defaultRolesDep.version).toBeTruthy();
      }
    });

    it('handles internal module dependencies within workspace', async () => {
      const cwd = fixture.getFixturePath();
      const project = new PgpmPackage(cwd);

      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      
      expect(moduleNames.length).toBeGreaterThan(1);
      
      for (const moduleName of moduleNames) {
        const deps = project.getModuleDependencies(moduleName);
        expect(deps).toHaveProperty('native');
        expect(deps).toHaveProperty('modules');
        expect(Array.isArray(deps.modules)).toBe(true);
      }
    });
  });
});
