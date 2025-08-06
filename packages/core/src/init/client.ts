import { Logger } from '@launchql/logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

const log = new Logger('init');

export class LaunchQLInit {
  private pool: Pool;
  private pgConfig: PgConfig;

  constructor(config: PgConfig) {
    this.pgConfig = config;
    this.pool = getPgPool(this.pgConfig);
  }

  /**
   * Bootstrap standard roles (anonymous, authenticated, administrator)
   */
  async bootstrapRoles(): Promise<void> {
    try {
      log.info('Bootstrapping LaunchQL roles...');
      
      const sqlPath = join(__dirname, 'sql', 'bootstrap-roles.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped LaunchQL roles');
    } catch (error) {
      log.error('Failed to bootstrap roles:', error);
      throw error;
    }
  }

  /**
   * Bootstrap test roles (roles only, no users)
   */
  async bootstrapTestRoles(): Promise<void> {
    try {
      log.info('Bootstrapping LaunchQL test roles...');
      
      const sqlPath = join(__dirname, 'sql', 'bootstrap-test-roles.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped LaunchQL test roles');
    } catch (error) {
      log.error('Failed to bootstrap test roles:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
  }
}
