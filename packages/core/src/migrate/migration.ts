import { LaunchQLProject } from '../core/class/launchql';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { deployModule } from '../modules/deploy';
import { revertModule } from '../modules/revert';
import { verifyModule } from '../modules/verify';

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
    await deployModule(
      getPgEnvOptions({ database: options.database }), 
      options.cwd, 
      { 
        useTransaction: options.useTransaction, 
        toChange: options.toChange 
      }
    );
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
    await revertModule(
      getPgEnvOptions({ database: options.database }), 
      options.cwd, 
      { 
        useTransaction: options.useTransaction, 
        toChange: options.toChange 
      }
    );
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
    await verifyModule(
      getPgEnvOptions({ database: options.database }), 
      options.cwd
    );
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
