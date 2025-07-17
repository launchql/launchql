import { LaunchQLProject } from '../class/launchql';
import { deployProject } from '../projects/deploy-project';
import { revertProject } from '../projects/revert-project';
import { verifyProject } from '../projects/verify-project';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { executeDeployStrategy, executeRevertStrategy, executeVerifyStrategy, StrategyOptions } from './strategy';

const log = new Logger('project-commands');

export interface MigrationOptions extends StrategyOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;  // Required if recursive=true
}

/**
 * Deploy - handles both recursive (multi-module) and non-recursive (single directory) deployments
 */
export async function deploy(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    const modulePath = modules[options.projectName].path;
    log.info(`Deploying project ${options.projectName} from ${modulePath} to database ${options.database}...`);
    
    await deployProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      modulePath, 
      options
    );
  } else {
    await executeDeployStrategy(
      getPgEnvOptions(),
      options.database,
      options.cwd,
      options
    );
  }
}

/**
 * Revert - handles both recursive (multi-module) and non-recursive (single directory) reverts
 */
export async function revert(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    log.info(`Reverting project ${options.projectName} on database ${options.database}...`);
    
    await revertProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      options
    );
  } else {
    await executeRevertStrategy(
      getPgEnvOptions(),
      options.database,
      options.cwd,
      options
    );
  }
}

/**
 * Verify - handles both recursive (multi-module) and non-recursive (single directory) verification
 */
export async function verify(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Module "${options.projectName}" not found`);
    }
    
    log.info(`Verifying project ${options.projectName} on database ${options.database}...`);
    
    await verifyProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      options
    );
  } else {
    await executeVerifyStrategy(
      getPgEnvOptions(),
      options.database,
      options.cwd,
      options
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

export const deployModules = deploy;
export const revertModules = revert;
export const verifyModules = verify;
