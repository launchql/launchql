import { LaunchQLProject } from '../core/class/launchql';
import { join } from 'path';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { LaunchQLMigrate } from '../migrate/client';

const log = new Logger('project-commands');

export interface MigrationOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;  // Required if recursive=true
  useTransaction?: boolean;
  toChange?: string;
  // Options for fast deployment
  fast?: boolean;
  usePlan?: boolean;
  cache?: boolean;
}

/**
 * Deploy a project - handles both recursive (multi-module) and non-recursive (single directory) deployments
 */
export async function deployModules(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    // Use existing deploy() from core that handles dependencies
    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
        
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    const modulePath = modules[options.projectName].path;
    log.info(`Deploying project ${options.projectName} from ${modulePath} to database ${options.database}...`);

    await project.deploy(
      getEnvOptions({ 
        pg: { database: options.database },
        deployment: {
          useTx: options.useTransaction,
          fast: options.fast,
          usePlan: options.usePlan,
          cache: options.cache
        }
      }), 
      options.projectName, 
      options.toChange
    );
  } else {
    // Direct execution on current directory
    const planPath = join(options.cwd, 'launchql.plan');
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.deploy({
      planPath,
      toChange: options.toChange,
      useTransaction: options.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Deployment failed at change: ${result.failed}`);
    }
  }
}

/**
 * Revert a project - handles both recursive (multi-module) and non-recursive (single directory) reverts
 */
export async function revertModules(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    // Use existing revert() from core
    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    log.info(`Reverting project ${options.projectName} on database ${options.database}...`);
    
    await project.revert(
      getEnvOptions({ 
        pg: { database: options.database },
        deployment: {
          useTx: options.useTransaction
        }
      }), 
      options.projectName, 
      options.toChange
    );
  } else {
    // Direct execution on current directory
    const planPath = join(options.cwd, 'launchql.plan');
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.revert({
      planPath,
      toChange: options.toChange,
      useTransaction: options.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Revert failed at change: ${result.failed}`);
    }
  }
}

/**
 * Verify a project - handles both recursive (multi-module) and non-recursive (single directory) verification
 */
export async function verifyModules(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    // Use existing verify() from core
    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    log.info(`Verifying project ${options.projectName} on database ${options.database}...`);
    
    await project.verify(
      getEnvOptions({ 
        pg: { database: options.database }
      }), 
      options.projectName, 
      options.toChange
    );
  } else {
    // Direct execution on current directory
    const planPath = join(options.cwd, 'launchql.plan');
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.verify({
      planPath
    });
    
    if (result.failed.length > 0) {
      throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
    }
  }
}

/**
 * Get available modules in a directory
 */
export async function getAvailableModules(cwd: string): Promise<string[]> {
  const project = new LaunchQLProject(cwd);
  const modules = await project.getModules();
  return modules.map(mod => mod.getModuleName());
}
