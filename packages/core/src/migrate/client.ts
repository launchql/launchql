import { Logger } from '@launchql/logger';
import { readFileSync } from 'fs';
import { dirname,join } from 'path';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

import { LaunchQLProject } from '../core/class/launchql';
import { Change, parsePlanFile, parsePlanFileSimple, readScript } from '../files';
import { DependencyResult, resolveDependencies } from '../resolution/deps';
import { resolveTagToChangeName } from '../resolution/resolve';
import { cleanSql } from './clean';
import {
  DeployOptions,
  DeployResult,
  RevertOptions,
  RevertResult,
  StatusResult,
  VerifyOptions,
  VerifyResult} from './types';
import { hashFile, hashSqlFile } from './utils/hash';
import { executeQuery, withTransaction } from './utils/transaction';

// Helper function to get changes in order
function getChangesInOrder(planPath: string, reverse: boolean = false): Change[] {
  const plan = parsePlanFileSimple(planPath);
  return reverse ? [...plan.changes].reverse() : plan.changes;
}

const log = new Logger('migrate');

export type HashMethod = 'content' | 'ast';

export interface LaunchQLMigrateOptions {
  /**
   * Hash method for SQL files:
   * - 'content': Hash the raw file content (fast, but sensitive to formatting changes)
   * - 'ast': Hash the parsed AST structure (robust, ignores formatting/comments but slower)
   */
  hashMethod?: HashMethod;
}

export class LaunchQLMigrate {
  private pool: Pool;
  private pgConfig: PgConfig;
  private hashMethod: HashMethod;
  private initialized: boolean = false;

  constructor(config: PgConfig, options: LaunchQLMigrateOptions = {}) {
    this.pgConfig = config;
    // Use environment variable DEPLOYMENT_HASH_METHOD if available, otherwise use options or default to 'content'
    const envHashMethod = process.env.DEPLOYMENT_HASH_METHOD as HashMethod;
    this.hashMethod = options.hashMethod || envHashMethod || 'content';
    this.pool = getPgPool(this.pgConfig);
  }

  /**
   * Calculate script hash using the configured method
   */
  private async calculateScriptHash(filePath: string): Promise<string> {
    if (this.hashMethod === 'ast') {
      return await hashSqlFile(filePath);
    } else {
      return await hashFile(filePath);
    }
  }

  /**
   * Initialize the migration schema
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      log.info('Checking LaunchQL migration schema...');
      
      // Check if launchql_migrate schema exists
      const result = await this.pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'launchql_migrate'
      `);
      
      if (result.rows.length === 0) {
        log.info('Schema not found, creating migration schema...');
        
        // Read and execute schema SQL to create schema and tables
        const schemaPath = join(__dirname, 'sql', 'schema.sql');
        const proceduresPath = join(__dirname, 'sql', 'procedures.sql');
        
        const schemaSql = readFileSync(schemaPath, 'utf-8');
        const proceduresSql = readFileSync(proceduresPath, 'utf-8');
        
        await this.pool.query(schemaSql);
        await this.pool.query(proceduresSql);
        
        log.success('Migration schema created successfully');
      } else {
        log.success('Migration schema found and ready');
      }

      this.initialized = true;
    } catch (error) {
      log.error('Failed to initialize migration schema:', error);
      throw error;
    }
  }

  /**
   * Deploy changes according to plan file
   */
  async deploy(options: DeployOptions): Promise<DeployResult> {
    await this.initialize();
    
    const { modulePath, toChange, useTransaction = true, debug = false, logOnly = false } = options;
    const planPath = join(modulePath, 'launchql.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = toChange && toChange.includes('@') ? resolveTagToChangeName(planPath, toChange, plan.project) : toChange;
    const changes = getChangesInOrder(planPath);
    
    
    const deployed: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: this.pgConfig.database
    });
    
    // Execute deployment with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && deployed.includes(resolvedToChange)) {
          break;
        }
        
        // Check if already deployed using target database connection
        try {
          const deployedResult = await executeQuery(
            context,
            'SELECT launchql_migrate.is_deployed($1::TEXT, $2::TEXT) as is_deployed',
            [plan.project, change.name]
          );
          
          if (deployedResult.rows[0]?.is_deployed) {
            log.info(`Skipping already deployed change: ${change.name}`);
            skipped.push(change.name);
            continue;
          }
        } catch (checkError: any) {
          // If the function doesn't exist, the schema hasn't been initialized
          if (checkError.code === '42883') { // undefined_function
            log.debug('Migration schema not found, will be initialized on first deploy');
          } else {
            throw checkError;
          }
        }
        
        // Read deploy script
        const deployScript = readScript(dirname(planPath), 'deploy', change.name);
        if (!deployScript) {
          log.error(`Deploy script not found for change: ${change.name}`);
          failed = change.name;
          break;
        }

        const cleanDeploySql = await cleanSql(deployScript, false, '$EOFCODE$');
                
        // Calculate script hash
        const scriptHash = await this.calculateScriptHash(join(dirname(planPath), 'deploy', `${change.name}.sql`));
        
        const changeKey = `/deploy/${change.name}.sql`;
        const resolvedChangeDeps = change.dependencies;
        
        try {
          // Call the deploy stored procedure
          await executeQuery(
            context,
            'CALL launchql_migrate.deploy($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT[], $5::TEXT, $6::BOOLEAN)',
            [
              plan.project,
              change.name,
              scriptHash,
              resolvedChangeDeps.length > 0 ? resolvedChangeDeps : null,
              cleanDeploySql,
              logOnly
            ]
          );
          
          deployed.push(change.name);
          log.success(`Successfully ${logOnly ? 'logged' : 'deployed'}: ${change.name}`);
        } catch (error: any) {
          // Build comprehensive error message
          const errorLines = [];
          errorLines.push(`Failed to deploy ${change.name}:`);
          errorLines.push(`  Change: ${change.name}`);
          errorLines.push(`  Project: ${plan.project}`);
          errorLines.push(`  Script Hash: ${scriptHash}`);
          errorLines.push(`  Dependencies: ${resolvedChangeDeps.length > 0 ? resolvedChangeDeps.join(', ') : 'none'}`);
          errorLines.push(`  Error Code: ${error.code || 'N/A'}`);
          errorLines.push(`  Error Message: ${error.message || 'N/A'}`);
          
          // Show SQL script preview for debugging
          if (cleanDeploySql) {
            const sqlLines = cleanDeploySql.split('\n');
            const previewLines = debug ? sqlLines : sqlLines.slice(0, 10);
            
            if (debug) {
              errorLines.push(`  Full SQL Script (${sqlLines.length} lines):`);
              previewLines.forEach((line, index) => {
                errorLines.push(`    ${index + 1}: ${line}`);
              });
            } else {
              errorLines.push(`  SQL Preview (first 10 lines):`);
              previewLines.forEach((line, index) => {
                errorLines.push(`    ${index + 1}: ${line}`);
              });
              if (sqlLines.length > 10) {
                errorLines.push(`    ... and ${sqlLines.length - 10} more lines`);
                errorLines.push(`    💡 Use debug mode to see full SQL script`);
              }
            }
          }
          
          
          // Provide debugging hints based on error code
          if (error.code === '25P02') {
            errorLines.push(`🔍 Debug Info: This error means a previous command in the transaction failed.`);
            errorLines.push(`   The SQL script above may contain the failing command.`);
            errorLines.push(`   Check the transaction query history for more details.`);
          } else if (error.code === '42P01') {
            errorLines.push(`💡 Hint: A table or view referenced in the SQL script does not exist.`);
            errorLines.push(`   Check if dependencies are applied in the correct order.`);
          } else if (error.code === '42883') {
            errorLines.push(`💡 Hint: A function referenced in the SQL script does not exist.`);
            errorLines.push(`   Check if required extensions or previous migrations are applied.`);
          }
          
          // Log the consolidated error message
          log.error(errorLines.join('\n'));
          
          failed = change.name;
          throw error; // Re-throw to trigger rollback if in transaction
        }
        
        // Stop if this was the target change
        if (toChange && change.name === toChange) {
          break;
        }
      }
    });
    
    return { deployed, skipped, failed };
  }

  /**
   * Revert changes according to plan file
   */
  async revert(options: RevertOptions): Promise<RevertResult> {
    await this.initialize();
    
    const { modulePath, toChange, useTransaction = true } = options;
    const planPath = join(modulePath, 'launchql.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = toChange && toChange.includes('@') ? resolveTagToChangeName(planPath, toChange, plan.project) : toChange;
    const changes = getChangesInOrder(planPath, true); // Reverse order for revert

    
    const reverted: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: this.pgConfig.database
    });

    // Execute revert with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && change.name === resolvedToChange) {
          break;
        }
        
        // Check if deployed
        const deployedResult = await executeQuery(
          context,
          'SELECT launchql_migrate.is_deployed($1::TEXT, $2::TEXT) as is_deployed',
          [plan.project, change.name]
        );
        
        if (!deployedResult.rows[0]?.is_deployed) {
          log.info(`Skipping not deployed change: ${change.name}`);
          skipped.push(change.name);
          continue;
        }
        
        // Read revert script
        const revertScript = readScript(dirname(planPath), 'revert', change.name);
        if (!revertScript) {
          log.error(`Revert script not found for change: ${change.name}`);
          failed = change.name;
          break;
        }

        const cleanRevertSql = await cleanSql(revertScript, false, '$EOFCODE$');
        
        try {
          // Call the revert stored procedure
          await executeQuery(
            context,
            'CALL launchql_migrate.revert($1, $2, $3)',
            [plan.project, change.name, cleanRevertSql]
          );
          
          reverted.push(change.name);
          log.success(`Successfully reverted: ${change.name}`);
        } catch (error) {
          log.error(`Failed to revert ${change.name}:`, error);
          failed = change.name;
          throw error; // Re-throw to trigger rollback if in transaction
        }
      }
    });
    
    return { reverted, skipped, failed };
  }

  /**
   * Verify deployed changes
   */
  async verify(options: VerifyOptions): Promise<VerifyResult> {
    await this.initialize();
    
    const { modulePath, toChange } = options;
    const planPath = join(modulePath, 'launchql.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = toChange && toChange.includes('@') ? resolveTagToChangeName(planPath, toChange, plan.project) : toChange;
    const changes = getChangesInOrder(planPath);
    
    const verified: string[] = [];
    const failed: string[] = [];
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: this.pgConfig.database
    });

    try {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && change.name === resolvedToChange) {
          break;
        }
        
        // Check if deployed
        const isDeployed = await this.isDeployed(plan.project, change.name);
        if (!isDeployed) {
          continue;
        }
        
        // Read verify script
        const verifyScript = readScript(dirname(planPath), 'verify', change.name);
        if (!verifyScript) {
          log.warn(`Verify script not found for change: ${change.name}`);
          continue;
        }
        
        const cleanVerifySql = await cleanSql(verifyScript, false, '$EOFCODE$');

        try {
          // Call the verify function
          const result = await targetPool.query(
            'SELECT launchql_migrate.verify($1, $2, $3) as verified',
            [plan.project, change.name, cleanVerifySql]
          );
          
          if (result.rows[0].verified) {
            verified.push(change.name);
            log.success(`Successfully verified: ${change.name}`);
          } else {
            failed.push(change.name);
            log.error(`Verification failed: ${change.name}`);
          }
        } catch (error) {
          log.error(`Failed to verify ${change.name}:`, error);
          failed.push(change.name);
        }
      }
    } finally {
    }
    
    return { verified, failed };
  }

  /**
   * Get deployment status
   */
  async status(project?: string): Promise<StatusResult[]> {
    await this.initialize();
    
    const result = await this.pool.query(
      'SELECT * FROM launchql_migrate.status($1)',
      [project]
    );
    
    return result.rows.map(row => ({
      project: row.project,
      totalDeployed: row.total_deployed,
      lastChange: row.last_change,
      lastDeployed: new Date(row.last_deployed)
    }));
  }

  /**
   * Check if a change is deployed
   */
  async isDeployed(project: string, changeName: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT launchql_migrate.is_deployed($1::TEXT, $2::TEXT) as is_deployed',
      [project, changeName]
    );
    
    return result.rows[0].is_deployed;
  }

  /**
   * Check if Sqitch tables exist in the database
   */
  async hasSqitchTables(): Promise<boolean> {
    const result = await this.pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'sqitch' 
        AND table_name IN ('projects', 'changes', 'tags', 'events')
      )
    `);
    return result.rows[0].exists;
  }

  /**
   * Import from existing Sqitch deployment
   */
  async importFromSqitch(): Promise<void> {
    await this.initialize();
    
    try {
      log.info('Checking for existing Sqitch tables...');
      
      // Check if sqitch schema exists
      const schemaResult = await this.pool.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'sqitch')"
      );
      
      if (!schemaResult.rows[0].exists) {
        log.info('No Sqitch schema found, nothing to import');
        return;
      }
      
      // Import projects
      log.info('Importing Sqitch projects...');
      await this.pool.query(`
        INSERT INTO launchql_migrate.projects (project, created_at)
        SELECT DISTINCT project, now()
        FROM sqitch.projects
        ON CONFLICT (project) DO NOTHING
      `);
      
      // Import changes with dependencies
      log.info('Importing Sqitch changes...');
      await this.pool.query(`
        WITH change_data AS (
          SELECT 
            c.project,
            c.change,
            c.change_id,
            c.committed_at
          FROM sqitch.changes c
          WHERE c.change_id IN (
            SELECT change_id FROM sqitch.tags
          )
        )
        INSERT INTO launchql_migrate.changes (change_id, change_name, project, script_hash, deployed_at)
        SELECT 
          encode(sha256((cd.project || cd.change || cd.change_id)::bytea), 'hex'),
          cd.change,
          cd.project,
          cd.change_id,
          cd.committed_at
        FROM change_data cd
        ON CONFLICT (project, change_name) DO NOTHING
      `);
      
      // Import dependencies
      log.info('Importing Sqitch dependencies...');
      await this.pool.query(`
        INSERT INTO launchql_migrate.dependencies (change_id, requires)
        SELECT 
          c.change_id,
          d.dependency
        FROM launchql_migrate.changes c
        JOIN sqitch.dependencies d ON d.change_id = c.script_hash
        ON CONFLICT DO NOTHING
      `);
      
      log.success('Successfully imported Sqitch deployment history');
    } catch (error) {
      log.error('Failed to import from Sqitch:', error);
      throw error;
    }
  }

  /**
   * Get recent changes
   */
  async getRecentChanges(targetDatabase: string, limit: number = 10): Promise<any[]> {
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });

    try {
      const result = await targetPool.query(`
        SELECT 
          c.change_name,
          c.deployed_at,
          c.project
        FROM launchql_migrate.changes c
        ORDER BY c.deployed_at DESC NULLS LAST
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      log.error('Failed to get recent changes:', error);
      throw error;
    }
  }

  /**
   * Get pending changes (in plan but not deployed)
   */
  async getPendingChanges(planPath: string, targetDatabase: string): Promise<string[]> {
    const plan = parsePlanFileSimple(planPath);
    const allChanges = getChangesInOrder(planPath);
    
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });

    try {
      const deployedResult = await targetPool.query(`
        SELECT c.change_name
        FROM launchql_migrate.changes c
        WHERE c.project = $1 AND c.deployed_at IS NOT NULL
      `, [plan.project]);
      
      const deployedSet = new Set(deployedResult.rows.map((r: any) => r.change_name));
      return allChanges.filter(c => !deployedSet.has(c.name)).map(c => c.name);
    } catch (error: any) {
      // If schema doesn't exist, all changes are pending
      if (error.code === '42P01') { // undefined_table
        return allChanges.map(c => c.name);
      }
      throw error;
    }
  }

  /**
   * Get all deployed changes for a project
   */
  async getDeployedChanges(targetDatabase: string, project: string): Promise<any[]> {
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });

    try {
      const result = await targetPool.query(`
        SELECT 
          c.change_name,
          c.deployed_at,
          c.script_hash
        FROM launchql_migrate.changes c
        WHERE c.project = $1 AND c.deployed_at IS NOT NULL
        ORDER BY c.deployed_at ASC
      `, [project]);
      
      return result.rows;
    } catch (error: any) {
      // If schema doesn't exist, no changes are deployed
      if (error.code === '42P01') { // undefined_table
        return [];
      }
      throw error;
    }
  }

  /**
   * Get dependencies for a change
   */
  async getDependencies(project: string, changeName: string): Promise<string[]> {
    await this.initialize();
    
    try {
      const result = await this.pool.query(
        `SELECT d.requires 
         FROM launchql_migrate.dependencies d
         JOIN launchql_migrate.changes c ON c.change_id = d.change_id
         WHERE c.project = $1 AND c.change_name = $2`,
        [project, changeName]
      );
      
      return result.rows.map(row => row.requires);
    } catch (error) {
      log.error(`Failed to get dependencies for ${project}:${changeName}:`, error);
      return [];
    }
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}
