import { Logger } from '@pgpmjs/logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

const log = new Logger('init');

export class PgpmInit {
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
      log.info('Bootstrapping PGPM roles...');
      
      const sqlPath = join(__dirname, 'sql', 'bootstrap-roles.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped PGPM roles');
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
      log.warn('WARNING: This command creates test roles and should NEVER be run on a production database!');
      log.info('Bootstrapping PGPM test roles...');
      
      const sqlPath = join(__dirname, 'sql', 'bootstrap-test-roles.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped PGPM test roles');
    } catch (error) {
      log.error('Failed to bootstrap test roles:', error);
      throw error;
    }
  }

  /**
   * Bootstrap database roles with custom username and password
   */
  async bootstrapDbRoles(username: string, password: string): Promise<void> {
    try {
      log.info(`Bootstrapping PGPM database roles for user: ${username}...`);
      
      const sql = `
BEGIN;
DO $do$
DECLARE
  v_username TEXT := '${username.replace(/'/g, "''")}';
  v_password TEXT := '${password.replace(/'/g, "''")}';
BEGIN
  BEGIN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_username, v_password);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
END
$do$;

-- Robust GRANTs under concurrency: GRANT can race on pg_auth_members unique index.
-- Catch unique_violation (23505) and continue so CI/CD concurrent jobs don't fail.
DO $do$
DECLARE
  v_username TEXT := '${username.replace(/'/g, "''")}';
BEGIN
  BEGIN
    EXECUTE format('GRANT %I TO %I', 'anonymous', v_username);
  EXCEPTION
    WHEN unique_violation THEN
      -- Membership was granted concurrently; ignore.
      NULL;
    WHEN undefined_object THEN
      -- One of the roles doesn't exist yet; order operations as needed.
      RAISE NOTICE 'Missing role when granting % to %', 'anonymous', v_username;
  END;

  BEGIN
    EXECUTE format('GRANT %I TO %I', 'authenticated', v_username);
  EXCEPTION
    WHEN unique_violation THEN
      -- Membership was granted concurrently; ignore.
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Missing role when granting % to %', 'authenticated', v_username;
  END;
END
$do$;
COMMIT;
      `;
      
      await this.pool.query(sql);
      
      log.success(`Successfully bootstrapped PGPM database roles for user: ${username}`);
    } catch (error) {
      log.error(`Failed to bootstrap database roles for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Remove database roles and revoke grants
   */
  async removeDbRoles(username: string): Promise<void> {
    try {
      log.info(`Removing PGPM database roles for user: ${username}...`);
      
      const sql = `
BEGIN;
DO $do$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = '${username}') THEN
    REVOKE anonymous FROM ${username};
    REVOKE authenticated FROM ${username};
    DROP ROLE ${username};
END IF;
END
$do$;
COMMIT;
      `;
      
      await this.pool.query(sql);
      
      log.success(`Successfully removed PGPM database roles for user: ${username}`);
    } catch (error) {
      log.error(`Failed to remove database roles for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
  }
}
