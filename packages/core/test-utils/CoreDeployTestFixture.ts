import { getEnvOptions } from '@launchql/env';
import { join } from 'path';
import { teardownPgPools } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

import { LaunchQLProject } from '../src/core/class/launchql';
import { MigrateTestFixture, TestDatabase } from './index';
import { TestFixture } from './TestFixture';

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

  async deployModule(target: string, database: string, fixturePath: string[], logOnly: boolean = false): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      process.chdir(basePath);
      
      const project = new LaunchQLProject(basePath);
      
      const opts = getEnvOptions({ 
        pg: getPgEnvOptions({ database }),
        deployment: {
          fast: false,
          usePlan: true,
          logOnly
        }
      });

      const projectName = target.includes(':') ? target.split(':')[0] : target;
      const toChange = target.includes(':') ? target.split(':')[1] : undefined;
      await project.deploy(opts, projectName, toChange, true);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async revertModule(target: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      const projectName = target.includes(':') ? target.split(':')[0] : target;
      const projectPath = join(basePath, 'packages', projectName);
      process.chdir(projectPath);
      
      const project = new LaunchQLProject(projectPath);
      
      const opts = getEnvOptions({ 
        pg: getPgEnvOptions({ database })
      });

      const toChange = target.includes(':') ? target.split(':')[1] : undefined;
      await project.revert(opts, projectName, toChange, true);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async verifyModule(target: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      process.chdir(basePath);
      
      const project = new LaunchQLProject(basePath);
      
      const opts = getEnvOptions({ 
        pg: getPgEnvOptions({ database })
      });

      const projectName = target.includes(':') ? target.split(':')[0] : target;
      const toChange = target.includes(':') ? target.split(':')[1] : undefined;
      await project.verify(opts, projectName, toChange, true);
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
