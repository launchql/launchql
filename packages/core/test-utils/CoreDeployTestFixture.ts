import { getEnvOptions } from '@pgpmjs/env';
import { teardownPgPools } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

import { PgpmPackage } from '../src/core/class/pgpm';
import { MigrateTestFixture } from './MigrateTestFixture';
import { TestDatabase } from './TestDatabase';
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

      const project = new PgpmPackage(basePath);

      const opts = getEnvOptions({
        pg: getPgEnvOptions({ database }),
        deployment: {
          fast: false,
          usePlan: true,
          logOnly
        }
      });

      await project.deploy(opts, target, true);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async revertModule(target: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();

    try {
      const project = new PgpmPackage(basePath);

      const opts = getEnvOptions({
        pg: getPgEnvOptions({ database })
      });

      await project.revert(opts, target, true);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async verifyModule(target: string, database: string, fixturePath: string[]): Promise<void> {
    const basePath = this.tempFixtureDir;
    const originalCwd = process.cwd();

    try {
      process.chdir(basePath);

      const project = new PgpmPackage(basePath);

      const opts = getEnvOptions({
        pg: getPgEnvOptions({ database })
      });

      await project.verify(opts, target, true);
    } finally {
      process.chdir(originalCwd);
    }
  }

  async cleanup(): Promise<void> {
    this.databases = [];

    if (this.migrateFixture) {
      await this.migrateFixture.cleanup();
    }

    await teardownPgPools();

    super.cleanup();
  }
}
