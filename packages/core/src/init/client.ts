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
      log.warn('WARNING: This command creates test roles and should NEVER be run on a production database!');
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
   * Bootstrap database roles with custom username and password
   */
  async bootstrapDbRoles(username: string, password: string): Promise<void> {
    try {
      log.info(`Bootstrapping LaunchQL database roles for user: ${username}...`);
      
      const sql = `
BEGIN;
DO $do$
DECLARE
  v_username TEXT := '${username.replace(/'/g, "''")}';
  v_password TEXT := '${password.replace(/'/g, "''")}';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_username) THEN
    BEGIN
      PERFORM pg_advisory_xact_lock(42, hashtext(v_username));
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_username, v_password);
    EXCEPTION
      WHEN duplicate_object OR unique_violation THEN
        NULL;
    END;
  END IF;
END
$do$;

DO $do$
DECLARE
  v_username TEXT := '${username.replace(/'/g, "''")}';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'anonymous' AND r2.rolname = v_username
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'anonymous', v_username);
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'anonymous', v_username;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'authenticated' AND r2.rolname = v_username
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'authenticated', v_username);
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'authenticated', v_username;
    END;
  END IF;
END
$do$;
COMMIT;
      `;
      
      await this.pool.query(sql);
      
      log.success(`Successfully bootstrapped LaunchQL database roles for user: ${username}`);
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
      log.info(`Removing LaunchQL database roles for user: ${username}...`);
      
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
      
      log.success(`Successfully removed LaunchQL database roles for user: ${username}`);
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
