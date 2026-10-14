import { Logger } from '@pgpmjs/logger';
import { RoleMapping, TestUserCredentials } from '@pgpmjs/types';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

import { 
  CreateUserOptions,
  generateCreateBaseRolesSQL, 
  generateCreateClientRoleSQL,
  generateCreateTestUsersSQL,
  generateCreateUserSQL, 
  generateRemoveUserSQL
} from '../roles';

const log = new Logger('init');

export class PgpmInit {
  private pool: Pool;
  private pgConfig: PgConfig;

  constructor(config: PgConfig) {
    this.pgConfig = config;
    this.pool = getPgPool(this.pgConfig);
  }

  /**
   * Bootstrap standard roles (anonymous, authenticated, administrator).
   * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
   * @param roles - Role mapping from getConnEnvOptions().roles!
   */
  async bootstrapRoles(roles: RoleMapping): Promise<void> {
    try {
      log.info('Bootstrapping PGPM roles...');
      
      const sql = generateCreateBaseRolesSQL(roles);
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped PGPM roles');
    } catch (error) {
      log.error('Failed to bootstrap roles:', error);
      throw error;
    }
  }

  /**
   * Bootstrap the restricted client role (authenticated_client) for SQL-level
   * proxy clients. Opt-in via `pgpm admin-users bootstrap --client`.
   * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
   * @param roles - Role mapping from getConnEnvOptions().roles!
   */
  async bootstrapClientRole(roles: RoleMapping): Promise<void> {
    try {
      log.info('Bootstrapping PGPM client role...');

      const sql = generateCreateClientRoleSQL(roles);
      await this.pool.query(sql);

      log.success('Successfully bootstrapped PGPM client role');
    } catch (error) {
      log.error('Failed to bootstrap client role:', error);
      throw error;
    }
  }

  /**
   * Bootstrap test roles (app_user, app_admin with grants to base roles).
   * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
   * @param roles - Role mapping from getConnEnvOptions().roles!
   * @param connections - Test user credentials from getConnEnvOptions().connections!
   */
  async bootstrapTestRoles(roles: RoleMapping, connections: TestUserCredentials): Promise<void> {
    try {
      log.warn('WARNING: This command creates test roles and should NEVER be run on a production database!');
      log.info('Bootstrapping PGPM test roles...');
      
      const sql = generateCreateTestUsersSQL(roles, connections);
      await this.pool.query(sql);
      
      log.success('Successfully bootstrapped PGPM test roles');
    } catch (error) {
      log.error('Failed to bootstrap test roles:', error);
      throw error;
    }
  }

  /**
   * Bootstrap database roles with custom username and password.
   * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
   * @param username - The username to create
   * @param password - The password for the user
   * @param roles - Role mapping from getConnEnvOptions().roles!
   * @param options - Role locking and explicit RLS bypass (off by default).
   */
  async bootstrapDbRoles(
    username: string, 
    password: string, 
    roles: RoleMapping,
    options: CreateUserOptions = {}
  ): Promise<void> {
    try {
      log.info(`Bootstrapping PGPM database roles for user: ${username}...`);
      
      const sql = generateCreateUserSQL(username, password, roles, options);
      await this.pool.query(sql);
      
      log.success(`Successfully bootstrapped PGPM database roles for user: ${username}`);
    } catch (error) {
      log.error(`Failed to bootstrap database roles for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Remove database roles and revoke grants.
   * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
   * @param username - The username to remove
   * @param roles - Role mapping from getConnEnvOptions().roles!
   * @param useLocksForRoles - Whether to use advisory locks (from getConnEnvOptions().useLocksForRoles)
   */
  async removeDbRoles(
    username: string, 
    roles: RoleMapping,
    useLocksForRoles = false
  ): Promise<void> {
    try {
      log.info(`Removing PGPM database roles for user: ${username}...`);
      
      const sql = generateRemoveUserSQL(username, roles, useLocksForRoles);
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
