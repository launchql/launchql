import { TestFixture } from '../../../test-utils';
import { deployModules, revertModules, MigrationOptions } from '../../../src/migrate/migration';
import { MigrateTestFixture, TestDatabase } from '../../../../migrate/test-utils';
import { join } from 'path';

export class CoreDeployTestFixture extends TestFixture {
  private databases: TestDatabase[] = [];
  private migrateFixture?: MigrateTestFixture;

  constructor(...fixturePath: string[]) {
    super(...fixturePath);
    this.migrateFixture = new MigrateTestFixture();
  }

  async setupTestDatabase(): Promise<TestDatabase> {
    if (!this.migrateFixture) {
      throw new Error('MigrateTestFixture not initialized');
    }
    
    const db = await this.migrateFixture.setupTestDatabase();
    this.databases.push(db);
    return db;
  }

  async deployModule(projectName: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      process.chdir(basePath);
      
      const options: MigrationOptions = {
        database,
        cwd: basePath,
        recursive: true,
        projectName,
        fast: true,
        usePlan: true
      };

      await deployModules(options);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async revertModule(projectName: string, database: string, fixturePath: string[], toChange?: string): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      const projectPath = join(basePath, 'packages', projectName);
      process.chdir(projectPath);
      
      const options: MigrationOptions = {
        database,
        cwd: projectPath,
        recursive: true,
        projectName,
        toChange
      };

      await revertModules(options);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async cleanup(): Promise<void> {
    for (const db of this.databases) {
      await db.close();
    }
    this.databases = [];
    
    if (this.migrateFixture) {
      await this.migrateFixture.cleanup();
    }
    
    super.cleanup();
  }
}
