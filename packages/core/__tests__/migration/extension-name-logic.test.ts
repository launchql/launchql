import { LaunchQLProject } from '../../src/core/class/launchql';
import { LaunchQLMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, teardownAllPools, TestDatabase, TestFixture } from '../../test-utils';
import { join } from 'path';

describe('Extension Name Logic Tests', () => {
  let fixture: MigrateTestFixture;
  let projectFixture: TestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    projectFixture = new TestFixture('sqitch');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
    projectFixture.cleanup();
  });

  afterAll(async () => {
    await teardownAllPools();
  });

  describe('toChange parameter handling in recursive operations', () => {
    test('should verify current behavior: extension === name ? toChange : undefined', async () => {
      
      const moduleADir = fixture.createPlanFile('module-a', [
        { name: 'common_change' }
      ]);
      fixture.createScript(moduleADir, 'deploy', 'common_change', 
        'CREATE SCHEMA module_a_schema;'
      );
      fixture.createScript(moduleADir, 'verify', 'common_change', 
        'SELECT 1/count(*) FROM information_schema.schemata WHERE schema_name = \'module_a_schema\';'
      );
      
      const moduleBDir = fixture.createPlanFile('module-b', [
        { name: 'common_change', dependencies: ['module-a:common_change'] }
      ]);
      fixture.createScript(moduleBDir, 'deploy', 'common_change', 
        'CREATE SCHEMA module_b_schema;'
      );
      fixture.createScript(moduleBDir, 'verify', 'common_change', 
        'SELECT 1/count(*) FROM information_schema.schemata WHERE schema_name = \'module_b_schema\';'
      );

      const clientA = new LaunchQLMigrate(db.config);
      await clientA.deploy({ modulePath: moduleADir });
      
      const clientB = new LaunchQLMigrate(db.config);
      await clientB.deploy({ modulePath: moduleBDir });

      const resultB = await clientB.verify({
        modulePath: moduleBDir,
        toChange: 'common_change'
      });

      expect(resultB.verified).toEqual(['common_change']);
      expect(resultB.failed).toEqual([]);
    });

    test('should demonstrate potential issue with same change names across modules', async () => {
      
      const moduleADir = fixture.createPlanFile('module-a', [
        { name: 'setup' },
        { name: 'common_name', dependencies: ['setup'] }
      ]);
      fixture.createScript(moduleADir, 'deploy', 'setup', 
        'CREATE SCHEMA module_a_base;'
      );
      fixture.createScript(moduleADir, 'deploy', 'common_name', 
        'CREATE TABLE module_a_base.test_table (id INT);'
      );
      fixture.createScript(moduleADir, 'verify', 'setup', 
        'SELECT 1/count(*) FROM information_schema.schemata WHERE schema_name = \'module_a_base\';'
      );
      fixture.createScript(moduleADir, 'verify', 'common_name', 
        'SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = \'module_a_base\' AND table_name = \'test_table\';'
      );
      
      const moduleBDir = fixture.createPlanFile('module-b', [
        { name: 'init', dependencies: ['module-a:setup'] },
        { name: 'common_name', dependencies: ['init', 'module-a:common_name'] }
      ]);
      fixture.createScript(moduleBDir, 'deploy', 'init', 
        'CREATE SCHEMA module_b_base;'
      );
      fixture.createScript(moduleBDir, 'deploy', 'common_name', 
        'CREATE TABLE module_b_base.test_table (id INT);'
      );
      fixture.createScript(moduleBDir, 'verify', 'init', 
        'SELECT 1/count(*) FROM information_schema.schemata WHERE schema_name = \'module_b_base\';'
      );
      fixture.createScript(moduleBDir, 'verify', 'common_name', 
        'SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = \'module_b_base\' AND table_name = \'test_table\';'
      );

      const clientA = new LaunchQLMigrate(db.config);
      await clientA.deploy({ modulePath: moduleADir });
      
      const clientB = new LaunchQLMigrate(db.config);
      await clientB.deploy({ modulePath: moduleBDir });

      const resultB = await clientB.verify({
        modulePath: moduleBDir,
        toChange: 'common_name'
      });

      expect(resultB.verified).toEqual(['init', 'common_name']);
      expect(resultB.failed).toEqual([]);

    });
  });

  describe('LaunchQLMigrate client toChange parameter behavior', () => {
    test('should verify how LaunchQLMigrate.deploy handles toChange parameter', async () => {
      const fixturePath = fixture.setupFixture(['migrate', 'simple']);
      const client = new LaunchQLMigrate(db.config);
      
      const result1 = await client.deploy({
        modulePath: fixturePath,
        toChange: 'schema'
      });
      
      expect(result1.deployed).toEqual(['schema']);
      expect(result1.deployed).not.toContain('table');
      expect(result1.deployed).not.toContain('index');
      
      const result2 = await client.deploy({
        modulePath: fixturePath,
        toChange: undefined
      });
      
      expect(result2.deployed).toEqual(['table', 'index']);
      expect(result2.skipped).toEqual(['schema']);
    });

    test('should verify how LaunchQLMigrate.verify handles toChange parameter', async () => {
      const fixturePath = fixture.setupFixture(['migrate', 'simple']);
      const client = new LaunchQLMigrate(db.config);
      
      await client.deploy({ modulePath: fixturePath });
      
      const result1 = await client.verify({
        modulePath: fixturePath,
        toChange: 'schema'
      });
      
      expect(result1.verified).toEqual(['schema']);
      expect(result1.verified).not.toContain('table');
      expect(result1.verified).not.toContain('index');
      
      const result2 = await client.verify({
        modulePath: fixturePath,
        toChange: undefined
      });
      
      expect(result2.verified).toEqual(['schema', 'table', 'index']);
    });

    test('should verify how LaunchQLMigrate.revert handles toChange parameter', async () => {
      const fixturePath = fixture.setupFixture(['migrate', 'simple']);
      const client = new LaunchQLMigrate(db.config);
      
      await client.deploy({ modulePath: fixturePath });
      
      const result1 = await client.revert({
        modulePath: fixturePath,
        toChange: 'table'
      });
      
      expect(result1.reverted).toEqual(['index']);
      expect(result1.reverted).not.toContain('table');
      expect(result1.reverted).not.toContain('schema');
      
      const result2 = await client.revert({
        modulePath: fixturePath,
        toChange: undefined
      });
      
      expect(result2.reverted).toEqual(['table', 'schema']);
    });
  });

  describe('Project prefix detection and parsing', () => {
    test('should detect and parse project-prefixed change names', () => {
      const testCases = [
        { input: 'simple_change', expectedProject: null, expectedChange: 'simple_change' },
        { input: 'project-a:change_name', expectedProject: 'project-a', expectedChange: 'change_name' },
        { input: 'my-module:@v1.0.0', expectedProject: 'my-module', expectedChange: '@v1.0.0' },
        { input: 'complex-project-name:complex_change_name', expectedProject: 'complex-project-name', expectedChange: 'complex_change_name' },
        { input: ':invalid', expectedProject: null, expectedChange: ':invalid' },
        { input: 'no-colon', expectedProject: null, expectedChange: 'no-colon' }
      ];

      testCases.forEach(({ input, expectedProject, expectedChange }) => {
        const colonIndex = input.indexOf(':');
        const actualProject = colonIndex > 0 ? input.substring(0, colonIndex) : null;
        const actualChange = colonIndex > 0 ? input.substring(colonIndex + 1) : input;
        
        expect(actualProject).toBe(expectedProject);
        expect(actualChange).toBe(expectedChange);
      });
    });

    test('should demonstrate more robust change detection logic', () => {
      const scenarios = [
        {
          description: 'Same project, same change name',
          extensionName: 'my-module',
          targetModuleName: 'my-module', 
          toChange: 'common_change',
          expectedShouldPassToChange: true
        },
        {
          description: 'Different project, same change name',
          extensionName: 'dependency-module',
          targetModuleName: 'my-module',
          toChange: 'common_change',
          expectedShouldPassToChange: false
        },
        {
          description: 'Same project, different change name',
          extensionName: 'my-module',
          targetModuleName: 'my-module',
          toChange: 'different_change',
          expectedShouldPassToChange: true
        },
        {
          description: 'Project-prefixed toChange targeting different module',
          extensionName: 'dependency-module',
          targetModuleName: 'my-module',
          toChange: 'dependency-module:specific_change',
          expectedShouldPassToChange: true // Should pass because it explicitly targets this module
        },
        {
          description: 'Project-prefixed toChange targeting different module (not this one)',
          extensionName: 'dependency-module',
          targetModuleName: 'my-module',
          toChange: 'other-module:specific_change',
          expectedShouldPassToChange: false
        }
      ];

      scenarios.forEach(({ description, extensionName, targetModuleName, toChange, expectedShouldPassToChange }) => {
        const currentLogic = extensionName === targetModuleName ? toChange : undefined;
        const currentResult = currentLogic !== undefined;

        const colonIndex = toChange.indexOf(':');
        const hasProjectPrefix = colonIndex > 0;
        
        let shouldPassToChange: boolean;
        if (hasProjectPrefix) {
          const targetProject = toChange.substring(0, colonIndex);
          shouldPassToChange = targetProject === extensionName;
        } else {
          shouldPassToChange = extensionName === targetModuleName;
        }

        console.log(`${description}:`);
        console.log(`  Current logic result: ${currentResult}`);
        console.log(`  Proposed logic result: ${shouldPassToChange}`);
        console.log(`  Expected: ${expectedShouldPassToChange}`);
        
        expect(shouldPassToChange).toBe(expectedShouldPassToChange);
      });
    });
  });

  describe('Unified target parameter in LaunchQLProject methods', () => {
    test('should deploy entire project when target is project name only', async () => {
      const workspaceDir = projectFixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspaceDir);
      
      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      expect(moduleNames.length).toBeGreaterThan(0);
      
      const firstModule = moduleNames[0];
      
      await project.deploy(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        firstModule,
        false
      );

      const client = new LaunchQLMigrate(db.config);
      const isDeployed = await client.isDeployed(firstModule, project.getLatestChange(firstModule));
      expect(isDeployed).toBe(true);
    });

    test('should deploy up to specific change when target is project:change', async () => {
      const workspaceDir = projectFixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspaceDir);
      
      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      const firstModule = moduleNames[0];
      const latestChange = project.getLatestChange(firstModule);
      
      await project.deploy(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        `${firstModule}:${latestChange}`,
        false
      );

      const client = new LaunchQLMigrate(db.config);
      const isDeployed = await client.isDeployed(firstModule, latestChange);
      expect(isDeployed).toBe(true);
    });

    test('should handle cross-project dependencies with target parameter', async () => {
      const workspaceDir = projectFixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspaceDir);
      
      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      expect(moduleNames.length).toBeGreaterThan(1);
      
      const firstModule = moduleNames[0];
      const secondModule = moduleNames[1];
      const firstChange = project.getLatestChange(firstModule);
      
      await project.deploy(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        `${secondModule}:${firstChange}`,
        true
      );

      const client = new LaunchQLMigrate(db.config);
      const isFirstModuleDeployed = await client.isDeployed(firstModule, firstChange);
      expect(isFirstModuleDeployed).toBe(true);
    });

    test('should verify up to specific change when target is project:change', async () => {
      const workspaceDir = projectFixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspaceDir);
      
      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      const firstModule = moduleNames[0];
      const latestChange = project.getLatestChange(firstModule);
      
      await project.deploy(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        firstModule,
        false
      );

      await project.verify(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        `${firstModule}:${latestChange}`,
        false
      );

      const client = new LaunchQLMigrate(db.config);
      const isVerified = await client.isDeployed(firstModule, latestChange);
      expect(isVerified).toBe(true);
    });

    test('should revert up to specific change when target is project:change', async () => {
      const workspaceDir = projectFixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspaceDir);
      
      const moduleMap = project.getModuleMap();
      const moduleNames = Object.keys(moduleMap);
      const firstModule = moduleNames[0];
      const latestChange = project.getLatestChange(firstModule);
      
      await project.deploy(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        firstModule,
        false
      );

      await project.revert(
        {
          pg: db.config,
          deployment: { useTx: true, fast: false, usePlan: true, logOnly: false }
        },
        `${firstModule}:${latestChange}`,
        false
      );

      const client = new LaunchQLMigrate(db.config);
      const isReverted = await client.isDeployed(firstModule, latestChange);
      expect(isReverted).toBe(false);
    });
  });
});
