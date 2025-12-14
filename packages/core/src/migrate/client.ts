import { Logger } from '@pgpmjs/logger';
import { errors } from '@pgpmjs/types';
import { readFileSync } from 'fs';
import { dirname,join } from 'path';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

import { Change, parsePlanFile, parsePlanFileSimple, readScript } from '../files';
import { resolveDependencies } from '../resolution/deps';
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
import { EventLogger } from './utils/event-logger';
import { hashFile, hashSqlFile } from './utils/hash';
import { executeQuery, withTransaction } from './utils/transaction';

// Helper function to get changes in order
function getChangesInOrder(planPath: string, reverse: boolean = false): Change[] {
  const plan = parsePlanFileSimple(planPath);
  return reverse ? [...plan.changes].reverse() : plan.changes;
}

const log = new Logger('migrate');

export type HashMethod = 'content' | 'ast';

export interface PgpmMigrateOptions {
  /**
   * Hash method for SQL files:
   * - 'content': Hash the raw file content (fast, but sensitive to formatting changes)
   * - 'ast': Hash the parsed AST structure (robust, ignores formatting/comments but slower)
   */
  hashMethod?: HashMethod;
}

export class PgpmMigrate {
  private pool: Pool;
  private pgConfig: PgConfig;
  private hashMethod: HashMethod;
  private eventLogger: EventLogger;
  private initialized: boolean = false;

  private toUnqualifiedLocal(pkg: string, nm: string) {
    if (!nm.includes(':')) return nm;
    const [p, local] = nm.split(':', 2);
    if (p === pkg) return local;
    throw new Error(`Cross-package change encountered in local tracking: ${nm} (current package: ${pkg})`);
  }

  constructor(config: PgConfig, options: PgpmMigrateOptions = {}) {
    this.pgConfig = config;
    // Use environment variable DEPLOYMENT_HASH_METHOD if available, otherwise use options or default to 'content'
    const envHashMethod = process.env.DEPLOYMENT_HASH_METHOD as HashMethod;
    this.hashMethod = options.hashMethod || envHashMethod || 'content';
    this.pool = getPgPool(this.pgConfig);
    this.eventLogger = new EventLogger(this.pgConfig);
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
      
      // Check if pgpm_migrate schema exists
      const result = await this.pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'pgpm_migrate'
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
   * Resolve toChange parameter, handling tag resolution if needed
   */
  private resolveToChange(toChange: string | undefined, planPath: string, packageName: string): string | undefined {
    return toChange && toChange.includes('@') ? resolveTagToChangeName(planPath, toChange, packageName) : toChange;
  }

  /**
   * Deploy changes according to plan file
   */
  async deploy(options: DeployOptions): Promise<DeployResult> {
    await this.initialize();
    
    const { modulePath, toChange, useTransaction = true, debug = false, logOnly = false } = options;
    const planPath = join(modulePath, 'pgpm.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = this.resolveToChange(toChange, planPath, plan.package);
    const changes = getChangesInOrder(planPath);
    
    const fullPlanResult = parsePlanFile(planPath);
    const packageDir = dirname(planPath);
    
    const resolvedDeps = resolveDependencies(packageDir, fullPlanResult.data?.package || plan.package, {
      tagResolution: 'resolve',
      loadPlanFiles: true,
      source: options.usePlan === false ? 'sql' : 'plan'
    });
    
    const deployed: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool(this.pgConfig);
    
    // Execute deployment with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && deployed.includes(resolvedToChange)) {
          break;
        }
        
        const isDeployed = await this.isDeployed(plan.package, change.name);
        if (isDeployed) {
          log.info(`Skipping already deployed change: ${change.name}`);
          const unqualified = this.toUnqualifiedLocal(plan.package, change.name);
          skipped.push(unqualified);
          continue;
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
        const resolvedFromDeps = resolvedDeps?.deps[changeKey];
        const resolvedChangeDeps = (resolvedFromDeps !== undefined) ? resolvedFromDeps : change.dependencies;
        const qualifiedDeps = (resolvedChangeDeps && resolvedChangeDeps.length > 0)
          ? Array.from(new Set(resolvedChangeDeps.map((dep) => (dep.includes(':') ? dep : `${plan.package}:${dep}`))))
          : resolvedChangeDeps;
        
        try {
          // Call the deploy stored procedure
          await executeQuery(
            context,
            'CALL pgpm_migrate.deploy($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT[], $5::TEXT, $6::BOOLEAN)',
            [
              plan.package,
              change.name,
              scriptHash,
              qualifiedDeps && qualifiedDeps.length > 0 ? qualifiedDeps : null,
              cleanDeploySql,
              logOnly
            ]
          );
          
          const unqualified = this.toUnqualifiedLocal(plan.package, change.name);
          deployed.push(unqualified);
          log.success(`Successfully ${logOnly ? 'logged' : 'deployed'}: ${change.name}`);
        } catch (error: any) {
          // Log failure event outside of transaction
          await this.eventLogger.logEvent({
            eventType: 'deploy',
            changeName: change.name,
            package: plan.package,
            errorMessage: error.message || 'Unknown error',
            errorCode: error.code || null
          });

          // Build comprehensive error message
          const errorLines = [];
          errorLines.push(`Failed to deploy ${change.name}:`);
          errorLines.push(`  Change: ${change.name}`);
          errorLines.push(`  Package: ${plan.package}`);
          errorLines.push(`  Script Hash: ${scriptHash}`);
          errorLines.push(`  Dependencies: ${qualifiedDeps && qualifiedDeps.length > 0 ? qualifiedDeps.join(', ') : 'none'}`);
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
    const planPath = join(modulePath, 'pgpm.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = this.resolveToChange(toChange, planPath, plan.package);
    const changes = getChangesInOrder(planPath, true); // Reverse order for revert
    
    const reverted: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool(this.pgConfig);

    // Execute revert with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && change.name === resolvedToChange) {
          break;
        }
        
        // Check if deployed
        const isDeployed = await this.isDeployed(plan.package, change.name);
        if (!isDeployed) {
          log.info(`Skipping not deployed change: ${change.name}`);
          const unqualified = this.toUnqualifiedLocal(plan.package, change.name);
          skipped.push(unqualified);
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
            'CALL pgpm_migrate.revert($1, $2, $3)',
            [plan.package, change.name, cleanRevertSql]
          );
          
          reverted.push(change.name);
          log.success(`Successfully reverted: ${change.name}`);
        } catch (error: any) {
          // Log failure event outside of transaction
          await this.eventLogger.logEvent({
            eventType: 'revert',
            changeName: change.name,
            package: plan.package,
            errorMessage: error.message || 'Unknown error',
            errorCode: error.code || null
          });

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
    const planPath = join(modulePath, 'pgpm.plan');
    const plan = parsePlanFileSimple(planPath);
    const resolvedToChange = this.resolveToChange(toChange, planPath, plan.package);
    const changes = getChangesInOrder(planPath);
    
    const verified: string[] = [];
    const failed: string[] = [];
    
    // Use a separate pool for the target database
    const targetPool = getPgPool(this.pgConfig);

    try {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (resolvedToChange && change.name === resolvedToChange) {
          break;
        }
        
        // Check if deployed
        const isDeployed = await this.isDeployed(plan.package, change.name);
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
            'SELECT pgpm_migrate.verify($1, $2, $3) as verified',
            [plan.package, change.name, cleanVerifySql]
          );
          
          if (result.rows[0].verified) {
            verified.push(change.name);
            log.success(`Successfully verified: ${change.name}`);
          } else {
            const verificationError = new Error(`Verification failed for ${change.name}`) as any;
            verificationError.code = 'VERIFICATION_FAILED';
            throw verificationError;
          }
        } catch (error: any) {
          // Log failure event with rich error information
          await this.eventLogger.logEvent({
            eventType: 'verify',
            changeName: change.name,
            package: plan.package,
            errorMessage: error.message || 'Unknown error',
            errorCode: error.code || null
          });

          log.error(`Failed to verify ${change.name}:`, error);
          failed.push(change.name);
        }
      }
    } finally {
    }
    
    if (failed.length > 0) {
      throw errors.OPERATION_FAILED({ operation: 'Verification', reason: `${failed.length} change(s): ${failed.join(', ')}` });
    }
    
    return { verified, failed };
  }

  /**
   * Get deployment status
   */
  async status(packageName?: string): Promise<StatusResult[]> {
    await this.initialize();
    
    const result = await this.pool.query(
      'SELECT * FROM pgpm_migrate.status($1)',
      [packageName]
    );
    
    return result.rows.map(row => ({
      package: row.package,
      totalDeployed: row.total_deployed,
      lastChange: row.last_change,
      lastDeployed: new Date(row.last_deployed)
    }));
  }

  /**
   * Check if a change is deployed
   */
  async isDeployed(packageName: string, changeName: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT pgpm_migrate.is_deployed($1::TEXT, $2::TEXT) as is_deployed',
      [packageName, changeName]
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
      
      // Import packages
      log.info('Importing Sqitch packages...');
      await this.pool.query(`
        INSERT INTO pgpm_migrate.packages (package, created_at)
        SELECT DISTINCT project, now()
        FROM sqitch.projects
        ON CONFLICT (package) DO NOTHING
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
        INSERT INTO pgpm_migrate.changes (change_id, change_name, package, script_hash, deployed_at)
        SELECT 
          encode(sha256((cd.project || cd.change || cd.change_id)::bytea), 'hex'),
          cd.change,
          cd.project,
          cd.change_id,
          cd.committed_at
        FROM change_data cd
        ON CONFLICT (package, change_name) DO NOTHING
      `);
      
      // Import dependencies
      log.info('Importing Sqitch dependencies...');
      await this.pool.query(`
        INSERT INTO pgpm_migrate.dependencies (change_id, requires)
        SELECT 
          c.change_id,
          d.dependency
        FROM pgpm_migrate.changes c
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
          c.package
        FROM pgpm_migrate.changes c
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
        FROM pgpm_migrate.changes c
        WHERE c.package = $1 AND c.deployed_at IS NOT NULL
      `, [plan.package]);
      
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
  async getDeployedChanges(targetDatabase: string, packageName: string): Promise<any[]> {
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
        FROM pgpm_migrate.changes c
        WHERE c.package = $1 AND c.deployed_at IS NOT NULL
        ORDER BY c.deployed_at ASC
      `, [packageName]);
      
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
  async getDependencies(packageName: string, changeName: string): Promise<string[]> {
    await this.initialize();
    
    try {
      const result = await this.pool.query(
        `SELECT d.requires 
         FROM pgpm_migrate.dependencies d
         JOIN pgpm_migrate.changes c ON c.change_id = d.change_id
         WHERE c.package = $1 AND c.change_name = $2`,
        [packageName, changeName]
      );
      
      return result.rows.map(row => row.requires);
    } catch (error) {
      log.error(`Failed to get dependencies for ${packageName}:${changeName}:`, error);
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
