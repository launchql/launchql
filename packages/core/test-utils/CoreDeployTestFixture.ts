import { TestFixture } from './TestFixture';
import { LaunchQLProject } from '../src/core/class/launchql';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { MigrateTestFixture, TestDatabase } from './index';
import { teardownPgPools } from 'pg-cache';
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
      
      const project = new LaunchQLProject(basePath);
      
      const opts = getEnvOptions({ 
        pg: getPgEnvOptions({ database }),
        deployment: {
          fast: false,
          usePlan: true
        }
      });

      await project.deploy(opts, projectName, undefined, true);
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
      
      const project = new LaunchQLProject(projectPath);
      
      const opts = getEnvOptions({ 
        pg: getPgEnvOptions({ database })
      });

      await project.revert(opts, projectName, toChange, true);
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
    
    await teardownPgPools();
    
    // Small delay to ensure connections are fully closed
    await new Promise(resolve => setTimeout(resolve, 10));
    
    super.cleanup();
  }
}
