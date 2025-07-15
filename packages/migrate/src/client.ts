import { Pool, PoolConfig } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';
import {
  MigrateConfig,
  DeployOptions,
  RevertOptions,
  VerifyOptions,
  DeployResult,
  RevertResult,
  VerifyResult,
  StatusResult
} from './types';
import { parsePlanFileSimple, parsePlanFile, Change, readScript, scriptExists, LaunchQLProject } from '@launchql/core';
import { hashFile } from './utils/hash';
import { cleanSql } from './clean';
import { withTransaction, executeQuery, TransactionContext } from './utils/transaction';

// Helper function to get changes in order
async function getChangesInOrder(planPath: string, reverse: boolean = false): Promise<Change[]> {
  const planResult = parsePlanFile(planPath);
  if (planResult.errors && planResult.errors.length > 0) {
    throw new Error(`Failed to parse plan file: ${planResult.errors.map(e => e.message).join(', ')}`);
  }
  const plan = planResult.data!;
  
  console.log(`[getChangesInOrder] Processing plan for project: ${plan.project}`);
  console.log(`[getChangesInOrder] Found ${plan.changes.length} changes`);
  
  // Resolve tag dependencies in each change
  const resolvedChanges = await Promise.all(plan.changes.map(async change => {
    console.log(`[getChangesInOrder] Processing change: ${change.name}, dependencies: ${JSON.stringify(change.dependencies)}`);
    
    if (change.dependencies.length === 0) {
      return change;
    }
    
    const resolvedDependencies = await Promise.all(change.dependencies.map(async dep => {
      console.log(`[getChangesInOrder] Processing dependency: ${dep}`);
      
      if (!dep.includes('@')) {
        console.log(`[getChangesInOrder] No tag in dependency: ${dep}`);
        return dep;
      }
      
      const [projectPart, refPart] = dep.includes(':') ? dep.split(':', 2) : [plan.project, dep];
      console.log(`[getChangesInOrder] Split dependency - project: ${projectPart}, ref: ${refPart}`);
      
      if (refPart.startsWith('@')) {
        const tagName = refPart.substring(1);
        console.log(`[getChangesInOrder] Resolving tag: ${tagName} in project: ${projectPart}`);
        
        if (projectPart !== plan.project) {
          console.log(`[getChangesInOrder] External tag resolution for ${projectPart}:@${tagName}`);
          const externalChange = await resolveExternalTag(projectPart, tagName, dirname(planPath));
          console.log(`[getChangesInOrder] Resolved external tag to: ${externalChange}`);
          return `${projectPart}:${externalChange}`;
        } else {
          console.log(`[getChangesInOrder] Local tag resolution for @${tagName}`);
          const localChange = await resolveLocalTag(dirname(planPath), tagName);
          console.log(`[getChangesInOrder] Resolved local tag to: ${localChange}`);
          return localChange;
        }
      }
      
      return dep;
    }));
    
    console.log(`[getChangesInOrder] Final resolved dependencies for ${change.name}:`, resolvedDependencies);
    
    return {
      ...change,
      dependencies: resolvedDependencies
    };
  }));
  
  return reverse ? [...resolvedChanges].reverse() : resolvedChanges;
}

async function resolveLocalTag(planDir: string, tagName: string): Promise<string> {
  const planResult = parsePlanFile(join(planDir, 'launchql.plan'));
  if (planResult.errors && planResult.errors.length > 0) {
    throw new Error(`Failed to parse plan file: ${planResult.errors.map((e: any) => e.message).join(', ')}`);
  }
  
  const tag = planResult.data?.tags.find((t: any) => t.name === tagName);
  if (!tag) {
    throw new Error(`Tag not found: @${tagName}`);
  }
  return tag.change;
}

async function resolveExternalTag(projectName: string, tagName: string, planDir: string): Promise<string> {
  const workspaceRoot = dirname(planDir);
  const externalProjectPath = join(workspaceRoot, projectName);
  const externalPlanPath = join(externalProjectPath, 'launchql.plan');
  
  if (!existsSync(externalPlanPath)) {
    throw new Error(`External project plan not found: ${externalPlanPath}`);
  }
  
  const result = parsePlanFile(externalPlanPath);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Failed to parse external plan file: ${result.errors.map((e: any) => e.message).join(', ')}`);
  }
  
  const tag = result.data?.tags.find((t: any) => t.name === tagName);
  if (!tag) {
    throw new Error(`Tag not found in ${projectName}: @${tagName}`);
  }
  
  return tag.change;
}

function ensurePlanFile(where: string, planPath: string) {
  if (!planPath || !planPath.endsWith('.plan')) {
    throw new Error(`${where}: Plan file path is required, was given ${planPath}`);
  }
}

const log = new Logger('migrate');

export class LaunchQLMigrate {
  private pool: Pool;
  private pgConfig: PgConfig;
  private initialized: boolean = false;

  constructor(config: MigrateConfig) {
    this.pgConfig = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    };
    
    this.pool = getPgPool(this.pgConfig);
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
    
    const { project, targetDatabase, planPath, toChange, useTransaction = true } = options;
    ensurePlanFile('deploy', planPath);
    const planResult = parsePlanFile(planPath);
    if (planResult.errors && planResult.errors.length > 0) {
      throw new Error(`Failed to parse plan file: ${planResult.errors.map(e => e.message).join(', ')}`);
    }
    const plan = planResult.data!;
    
    log.info(`Parsed plan for ${project || plan.project}: ${plan.tags?.length || 0} tags, ${plan.changes?.length || 0} changes`);
    if (plan.tags && plan.tags.length > 0) {
      log.info(`Tags found: ${plan.tags.map(t => `${t.name}->${t.change}`).join(', ')}`);
    }
    
    const changes = await getChangesInOrder(planPath);
    
    const deployed: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });
    
    // Ensure migration schema exists on target database
    try {
      const schemaCheck = await targetPool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'launchql_migrate'
      `);
      
      if (schemaCheck.rows.length === 0) {
        log.info('Initializing migration schema on target database...');
        
        // Read and execute schema SQL to create schema and tables
        const schemaPath = join(__dirname, 'sql', 'schema.sql');
        const proceduresPath = join(__dirname, 'sql', 'procedures.sql');
        
        const schemaSql = readFileSync(schemaPath, 'utf-8');
        const proceduresSql = readFileSync(proceduresPath, 'utf-8');
        
        await targetPool.query(schemaSql);
        await targetPool.query(proceduresSql);
        
        log.success('Migration schema initialized on target database');
      }
    } catch (initError) {
      log.error('Failed to initialize migration schema on target database:', initError);
      throw initError;
    }

    // Execute deployment with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      // Ensure project exists before inserting tags or changes
      await executeQuery(
        context,
        'CALL launchql_migrate.register_project($1)',
        [project || plan.project]
      );
      
      if (plan.tags && plan.tags.length > 0) {
        log.info(`Populating ${plan.tags.length} tags for project ${project || plan.project}`);
        for (const tag of plan.tags) {
          try {
            await executeQuery(
              context,
              'INSERT INTO launchql_migrate.tags (project, tag_name, change_name) VALUES ($1, $2, $3) ON CONFLICT (project, tag_name) DO UPDATE SET change_name = EXCLUDED.change_name',
              [project || plan.project, tag.name, tag.change]
            );
            log.info(`Successfully inserted tag: ${tag.name} -> ${tag.change} for project ${project || plan.project}`);
          } catch (tagError) {
            log.error(`Failed to insert tag ${tag.name}:`, tagError);
            throw tagError; // Re-throw to see the actual error
          }
        }
        
        const tagCheck = await executeQuery(
          context,
          'SELECT tag_name, change_name FROM launchql_migrate.tags WHERE project = $1',
          [project || plan.project]
        );
        log.info(`Tags in database for project ${project || plan.project}:`, tagCheck.rows);
      }
      
      for (const change of changes) {
        // Stop if we've reached the target change
        if (toChange && deployed.includes(toChange)) {
          break;
        }
        
        log.debug(`Processing change: ${change.name}, dependencies: ${JSON.stringify(change.dependencies)}`)
        
        // Check if already deployed using target database connection
        try {
          const deployedResult = await executeQuery(
            context,
            'SELECT launchql_migrate.is_deployed($1, $2) as is_deployed',
            [project || plan.project, change.name]
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

        let updatedDeployScript = deployScript;
        
        const sqlLines = deployScript.split('\n');
        const requiresLines = sqlLines.filter(line => line.trim().startsWith('-- requires:'));
        
        if (requiresLines.length > 0 && change.dependencies.length > 0) {
          log.debug(`Processing ${change.dependencies.length} dependencies for ${change.name}`);
          log.debug(`Resolved dependencies from plan:`, change.dependencies);
          log.debug(`SQL requires lines:`, requiresLines);
          
          // For each requires line in SQL, find the corresponding resolved dependency
          for (const requiresLine of requiresLines) {
            const originalDep = requiresLine.replace('-- requires:', '').trim();
            
            if (originalDep.includes('@')) {
              // Find the resolved version by checking if any resolved dependency
              let resolvedDep = null;
              
              // For external tags like "project-x:@x1.1.0", we need to find the matching resolved dependency
              if (originalDep.includes(':@')) {
                const [projectPart] = originalDep.split(':@');
                resolvedDep = change.dependencies.find(dep => dep.startsWith(`${projectPart}:`));
              } else if (originalDep.startsWith('@')) {
                resolvedDep = change.dependencies.find(dep => !dep.includes(':'));
              }
              
              if (resolvedDep) {
                const searchPattern = `-- requires: ${originalDep}`;
                const replacePattern = `-- requires: ${resolvedDep}`;
                log.debug(`Replacing SQL comment: '${searchPattern}' -> '${replacePattern}'`);
                
                updatedDeployScript = updatedDeployScript.replace(searchPattern, replacePattern);
              } else {
                log.warn(`Could not find resolved dependency for: ${originalDep}`);
              }
            }
          }
        }

        // Check if we have cross-project dependencies
        const hasCrossProjectDeps = change.dependencies.some(dep => dep.includes(':'));
        
        let cleanDeploySql: string;
        if (hasCrossProjectDeps) {
          log.debug(`Skipping SQL cleaning for ${change.name} due to cross-project dependencies`);
          cleanDeploySql = updatedDeployScript;
        } else {
          // Clean SQL for same-project dependencies
          try {
            log.debug(`About to clean SQL for ${change.name}:`);
            log.debug(`Updated SQL content:`, updatedDeployScript);
            cleanDeploySql = await cleanSql(updatedDeployScript, false, '$EOFCODE$');
            log.debug(`Successfully cleaned SQL for ${change.name}`);
          } catch (cleanError) {
            log.warn(`SQL cleaning failed for ${change.name}, using updated SQL:`, cleanError);
            log.debug(`Failed SQL content:`, updatedDeployScript);
            cleanDeploySql = updatedDeployScript;
          }
        }
                
        // Calculate script hash
        const scriptHash = hashFile(join(dirname(planPath), 'deploy', `${change.name}.sql`));
        
        try {
          if (change.dependencies.length > 0) {
            log.debug(`Resolved dependencies for ${change.name}:`, change.dependencies);
          }
          
          if (hasCrossProjectDeps) {
            const externalProjects = change.dependencies
              .filter(dep => dep.includes(':'))
              .map(dep => dep.split(':')[0])
              .filter(proj => proj !== (project || plan.project));
            
            if (externalProjects.length > 0) {
              log.debug(`Prepending search_path setting for cross-project dependencies: ${externalProjects.join(',')}`);
              const searchPath = ['core', 'auth', 'app', 'public'].join(',');
              cleanDeploySql = `SET LOCAL search_path = ${searchPath};\n\n${cleanDeploySql}`;
              log.debug(`Updated SQL with search_path setting`);
            }
          }
          
          // Call the deploy stored procedure
          log.debug(`About to deploy ${change.name} with dependencies:`, change.dependencies);
          log.info(`Dependencies being passed to stored procedure for ${change.name}: ${JSON.stringify(change.dependencies)}`);
          await executeQuery(
            context,
            'CALL launchql_migrate.deploy($1, $2, $3, $4, $5)',
            [
              project || plan.project,
              change.name,
              scriptHash,
              change.dependencies,
              cleanDeploySql
            ]
          );
          
          deployed.push(change.name);
          log.success(`Successfully deployed: ${change.name}`);
        } catch (error) {
          log.error(`Failed to deploy ${change.name}:`, error);
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
    
    const { project, targetDatabase, planPath, toChange, useTransaction = true } = options;
    ensurePlanFile('revert', planPath);
    const plan = parsePlanFileSimple(planPath);
    const changes = await getChangesInOrder(planPath, true); // Reverse order for revert
    
    const reverted: string[] = [];
    const skipped: string[] = [];
    let failed: string | undefined;
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });
    
    // Execute revert with or without transaction
    await withTransaction(targetPool, { useTransaction }, async (context) => {
      for (const change of changes) {
        // Stop if we've reached the target change
        if (toChange && change.name === toChange) {
          break;
        }
        
        // Check if deployed
        const deployedResult = await executeQuery(
          context,
          'SELECT launchql_migrate.is_deployed($1, $2) as is_deployed',
          [project || plan.project, change.name]
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

        let cleanRevertSql: string;
        try {
          cleanRevertSql = await cleanSql(revertScript, false, '$EOFCODE$');
        } catch (cleanError) {
          log.warn(`SQL cleaning failed for ${change.name} revert, using original SQL:`, cleanError);
          cleanRevertSql = revertScript;
        }
        
        try {
          // Call the revert stored procedure
          await executeQuery(
            context,
            'CALL launchql_migrate.revert($1, $2, $3)',
            [project || plan.project, change.name, cleanRevertSql]
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
    
    const { project, targetDatabase, planPath } = options;
    ensurePlanFile('verify', planPath);
    const plan = parsePlanFileSimple(planPath);
    const changes = await getChangesInOrder(planPath);
    
    const verified: string[] = [];
    const failed: string[] = [];
    
    // Use a separate pool for the target database
    const targetPool = getPgPool({
      ...this.pgConfig,
      database: targetDatabase
    });
    
    try {
      for (const change of changes) {
        // Check if deployed
        const isDeployed = await this.isDeployed(project, change.name);
        if (!isDeployed) {
          continue;
        }
        
        // Read verify script
        const verifyScript = readScript(dirname(planPath), 'verify', change.name);
        if (!verifyScript) {
          log.warn(`Verify script not found for change: ${change.name}`);
          continue;
        }
        
        let cleanVerifySql: string;
        try {
          cleanVerifySql = await cleanSql(verifyScript, false, '$EOFCODE$');
        } catch (cleanError) {
          log.warn(`SQL cleaning failed for ${change.name} verify, using original SQL:`, cleanError);
          cleanVerifySql = verifyScript;
        }

        try {
          // Call the verify function
          const result = await targetPool.query(
            'SELECT launchql_migrate.verify($1, $2, $3) as verified',
            [project || plan.project, change.name, cleanVerifySql]
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
      'SELECT launchql_migrate.is_deployed($1, $2) as is_deployed',
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
    const allChanges = await getChangesInOrder(planPath);
    
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
   * Resolve tag references in dependencies
   */
  private async resolveDependencies(dependencies: string[], currentProject: string, planDir: string): Promise<string[]> {
    const resolved: string[] = [];
    
    for (const dep of dependencies) {
      if (dep.includes('@')) {
        const resolvedDep = await this.resolveDependencyReference(dep, currentProject, planDir);
        resolved.push(resolvedDep);
      } else {
        resolved.push(dep);
      }
    }
    
    return resolved;
  }

  /**
   * Resolve a dependency reference that may contain tags
   */
  private async resolveDependencyReference(dep: string, currentProject: string, planDir: string): Promise<string> {
    const [projectPart, refPart] = dep.includes(':') ? dep.split(':', 2) : [currentProject, dep];
    
    if (refPart.startsWith('@')) {
      const tagName = refPart.substring(1);
      log.debug(`Resolving tag reference: ${dep} (project: ${projectPart}, tag: ${tagName})`);
      
      if (projectPart !== currentProject) {
        const externalChange = await this.resolveExternalTag(projectPart, tagName, planDir);
        const resolved = `${projectPart}:${externalChange}`;
        log.debug(`Resolved external tag ${dep} to ${resolved}`);
        return resolved;
      } else {
        const localChange = await this.resolveLocalTag(tagName, planDir);
        log.debug(`Resolved local tag ${dep} to ${localChange}`);
        return localChange;
      }
    }
    
    return dep;
  }

  /**
   * Resolve a tag in the current project's plan
   */
  private async resolveLocalTag(tagName: string, planDir: string): Promise<string> {
    const planPath = join(planDir, 'launchql.plan');
    const result = parsePlanFile(planPath);
    
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Failed to parse plan file: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    const tag = result.data?.tags.find((t: any) => t.name === tagName);
    if (!tag) {
      throw new Error(`Tag not found: @${tagName}`);
    }
    
    return tag.change;
  }

  /**
   * Resolve a tag in an external project's plan
   */
  private  async resolveExternalTag(projectName: string, tagName: string, planDir: string): Promise<string> {
    const workspaceRoot = dirname(planDir);
    const externalProjectPath = join(workspaceRoot, projectName);
    const externalPlanPath = join(externalProjectPath, 'launchql.plan');
    
    if (!existsSync(externalPlanPath)) {
      throw new Error(`External project plan not found: ${externalPlanPath}`);
    }
    
    const result = parsePlanFile(externalPlanPath);
    
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Failed to parse external plan file: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    const tag = result.data?.tags.find((t: any) => t.name === tagName);
    if (!tag) {
      throw new Error(`Tag not found in ${projectName}: @${tagName}`);
    }
    
    return tag.change;
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}
