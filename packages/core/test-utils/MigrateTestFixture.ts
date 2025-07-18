import { PgConfig } from 'pg-env';
import { LaunchQLMigrate } from '../src/migrate/client';
import { mkdtempSync, rmSync, cpSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';
import { Pool } from 'pg';
import { TestDatabase } from './TestDatabase';
import { MigrateTestChange } from './MigrateTestChange';
import { FIXTURES_PATH } from './utils';

export class MigrateTestFixture {
  private tempDirs: string[] = [];
  private databases: TestDatabase[] = [];
  private dbCounter = 0;
  private pools: Pool[] = [];

  async setupTestDatabase(): Promise<TestDatabase> {
    const dbName = `test_migrate_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${this.dbCounter++}`;
    
    // Get base config from environment using pg-env
    const baseConfig = getPgEnvOptions({
      database: 'postgres'
    });
    
    // Create database using admin pool
    const adminPool = getPgPool(baseConfig);
    try {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    } catch (e) {
      if (e && typeof e === 'object' && 'errors' in e && Array.isArray((e as any).errors)) {
        for (const err of (e as any).errors) {
          console.error('AggregateError item:', err);
        }
      } else {
        console.error('Test failure:', e);
      }
      throw e;
    }
    
    // Get config for the new test database
    const pgConfig = getPgEnvOptions({
      database: dbName
    });
    
    const config: PgConfig = {
      host: pgConfig.host,
      port: pgConfig.port,
      user: pgConfig.user,
      password: pgConfig.password,
      database: pgConfig.database
    };

    // Initialize migrate schema
    const migrate = new LaunchQLMigrate(config);
    await migrate.initialize();

    // Get pool for test database operations
    const pool = getPgPool(pgConfig);
    this.pools.push(pool);

    const db: TestDatabase = {
      name: dbName,
      config,
      
      async query(sql: string, params?: any[]) {
        return pool.query(sql, params);
      },

      async exists(type: 'schema' | 'table', name: string) {
        if (type === 'schema') {
          const result = await pool.query(
            `SELECT EXISTS (
              SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = $1
            ) as exists`,
            [name]
          );
          return result.rows[0].exists;
        } else {
          const [schema, table] = name.includes('.') ? name.split('.') : ['public', name];
          const result = await pool.query(
            `SELECT EXISTS (
              SELECT 1 FROM information_schema.tables 
              WHERE table_schema = $1 AND table_name = $2
            ) as exists`,
            [schema, table]
          );
          return result.rows[0].exists;
        }
      },

      async getDeployedChanges() {
        const result = await pool.query(
          `SELECT project, change_name, deployed_at 
           FROM launchql_migrate.changes 
           ORDER BY deployed_at`
        );
        return result.rows;
      },

      async getDependencies(project: string, changeName: string) {
        const result = await pool.query(
          `SELECT d.requires 
           FROM launchql_migrate.dependencies d
           JOIN launchql_migrate.changes c ON c.change_id = d.change_id
           WHERE c.project = $1 AND c.change_name = $2`,
          [project, changeName]
        );
        return result.rows.map((row: any) => row.requires);
      },

      async close() {
        // Don't close the pool here as it's managed by pg-cache
        // Just mark this database as closed
      }
    };

    this.databases.push(db);
    return db;
  }

  setupFixture(fixturePath: string[]): string {
    const originalPath = join(FIXTURES_PATH, ...fixturePath);
    const fixtureName = fixturePath[fixturePath.length - 1]; // Use last element as fixture name
    const tempDir = mkdtempSync(join(tmpdir(), 'migrate-test-'));
    const fixtureDestPath = join(tempDir, fixtureName);
    
    cpSync(originalPath, fixtureDestPath, { recursive: true });
    this.tempDirs.push(tempDir);
    
    return fixtureDestPath;
  }

  createPlanFile(project: string, changes: MigrateTestChange[]): string {
    const tempDir = mkdtempSync(join(tmpdir(), 'migrate-test-'));
    this.tempDirs.push(tempDir);

    const lines = [
      '%syntax-version=1.0.0',
      `%project=${project}`,
      `%uri=https://github.com/test/${project}`,
      ''
    ];

    for (const change of changes) {
      let line = change.name;
      
      if (change.dependencies && change.dependencies.length > 0) {
        line += ` [${change.dependencies.join(' ')}]`;
      }
      
      line += ` ${change.timestamp || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`;
      line += ` ${change.planner || 'test'}`;
      line += ` <${change.email || 'test@example.com'}>`;
      
      if (change.comment) {
        line += ` # ${change.comment}`;
      }
      
      lines.push(line);
    }

    const planPath = join(tempDir, 'launchql.plan');
    writeFileSync(planPath, lines.join('\n'));
    
    return tempDir;
  }

  createScript(dir: string, type: 'deploy' | 'revert' | 'verify', name: string, content: string): void {
    const scriptDir = join(dir, type);
    mkdirSync(scriptDir, { recursive: true });
    writeFileSync(join(scriptDir, `${name}.sql`), content);
  }

  async cleanup(): Promise<void> {
    // Close all test database pools FIRST
    for (const pool of this.pools) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore errors during pool closure
      }
    }
    
    // Clear the pools array
    this.pools = [];
    
    // Small delay to ensure connections are fully closed
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Now get admin pool for database cleanup
    const adminConfig = getPgEnvOptions({
      database: 'postgres'
    });
    const adminPool = getPgPool(adminConfig);

    // Drop all test databases
    for (const db of this.databases) {
      try {
        await adminPool.query(`DROP DATABASE IF EXISTS "${db.name}"`);
      } catch (e) {
        // Ignore errors - database might have active connections
        console.warn(`Failed to drop database ${db.name}:`, (e as Error).message);
      }
    }

    // Remove temporary directories
    for (const dir of this.tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    
    // Clear the databases array
    this.databases = [];
  }
}
