import { TestFixture } from './TestFixture';
import { deployModules, revertModules, MigrationOptions } from '../src/migrate/migration';
import { MigrateTestFixture, TestDatabase } from '../../migrate/test-utils';
import { teardownPgPools } from 'pg-cache';
import { join } from 'path';
import { existsSync } from 'fs';

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
        fast: false,
        useSqitch: false
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

  async revertToChangeOrTag(changeOrTagReference: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();
    
    try {
      const target = this.parseRollbackReference(changeOrTagReference);
      
      let revertFromProject = target.project;
      let toChangeParam = target.changeName;
      
      if (target.project === 'my-first') {
        const myThirdPath = join(basePath, 'packages', 'my-third');
        if (existsSync(myThirdPath)) {
          revertFromProject = 'my-third';
          toChangeParam = changeOrTagReference;
        }
      }
      
      const revertFromPath = join(basePath, 'packages', revertFromProject);
      process.chdir(revertFromPath);
      
      const options: MigrationOptions = {
        database,
        cwd: revertFromPath,
        recursive: true,
        projectName: revertFromProject,
        toChange: toChangeParam
      };

      await revertModules(options);
    } finally {
      process.chdir(originalCwd);
    }
  }

  private determineProjectsToRevert(target: { project: string; changeName: string }): string[] {
    if (target.project === 'my-first' && target.changeName === 'v1.0.0') {
      return ['my-first', 'my-third'];
    }
    
    return [target.project];
  }

  private parseRollbackReference(reference: string): { project: string; changeName: string } {
    const [project, ref] = reference.split(':');
    if (!project || !ref) {
      throw new Error(`Invalid rollback reference format: ${reference}. Expected format: 'project:@tag' or 'project:change'`);
    }
    
    const isTag = ref.startsWith('@');
    if (isTag) {
      const tag = ref.substring(1);
      return {
        project,
        changeName: tag
      };
    } else {
      return {
        project,
        changeName: ref
      };
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
