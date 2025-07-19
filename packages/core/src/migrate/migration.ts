import { LaunchQLProject, ProjectContext } from '../core/class/launchql';
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
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function deployModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  const context = project.getContext();
  
  if (context === ProjectContext.Outside) {
    throw new Error(
      `Not in a LaunchQL workspace or module. ` +
      `Please run this command from within a workspace (containing launchql.json) ` +
      `or module (containing launchql.plan). Current directory: ${options.cwd}`
    );
  }
  
  if (options.recursive || context === ProjectContext.Workspace) {
    if (!options.projectName) {
      if (context === ProjectContext.Workspace) {
        throw new Error(
          `You are in a workspace root but no projectName was specified. ` +
          `Please specify a projectName or navigate to a specific module directory.`
        );
      } else {
        throw new Error('projectName is required when recursive is true');
      }
    }

    // Use existing deploy() from core that handles dependencies
    const modules = project.getModuleMap();
        
    if (!modules[options.projectName]) {
      const availableModules = Object.keys(modules);
      throw new Error(
        `Module "${options.projectName}" not found. ` +
        `Available modules: ${availableModules.length > 0 ? availableModules.join(', ') : 'none'}`
      );
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
  } else if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
    const modulePath = project.getModulePath();
    if (!modulePath) {
      throw new Error(`Could not resolve module path from cwd: ${options.cwd}`);
    }
    
    log.info(`Deploying module from ${modulePath} to database ${options.database}...`);
    
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.deploy({
      modulePath,
      toChange: options.toChange,
      useTransaction: options.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Deployment failed at change: ${result.failed}`);
    }
  } else {
    throw new Error(`Cannot determine operation context from cwd: ${options.cwd}. Context: ${context}`);
  }
}

/**
 * Revert a project - handles both recursive (multi-module) and non-recursive (single directory) reverts
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function revertModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  const context = project.getContext();
  
  if (context === ProjectContext.Outside) {
    throw new Error(
      `Not in a LaunchQL workspace or module. ` +
      `Please run this command from within a workspace (containing launchql.json) ` +
      `or module (containing launchql.plan). Current directory: ${options.cwd}`
    );
  }
  
  if (options.recursive || context === ProjectContext.Workspace) {
    if (!options.projectName) {
      if (context === ProjectContext.Workspace) {
        throw new Error(
          `You are in a workspace root but no projectName was specified. ` +
          `Please specify a projectName or navigate to a specific module directory.`
        );
      } else {
        throw new Error('projectName is required when recursive is true');
      }
    }

    // Use existing revert() from core
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      const availableModules = Object.keys(modules);
      throw new Error(
        `Module "${options.projectName}" not found. ` +
        `Available modules: ${availableModules.length > 0 ? availableModules.join(', ') : 'none'}`
      );
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
  } else if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
    const modulePath = project.getModulePath();
    if (!modulePath) {
      throw new Error(`Could not resolve module path from cwd: ${options.cwd}`);
    }
    
    log.info(`Reverting module from ${modulePath} on database ${options.database}...`);
    
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.revert({
      modulePath,
      toChange: options.toChange,
      useTransaction: options.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Revert failed at change: ${result.failed}`);
    }
  } else {
    throw new Error(`Cannot determine operation context from cwd: ${options.cwd}. Context: ${context}`);
  }
}

/**
 * Verify a project - handles both recursive (multi-module) and non-recursive (single directory) verification
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function verifyModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  const context = project.getContext();
  
  if (context === ProjectContext.Outside) {
    throw new Error(
      `Not in a LaunchQL workspace or module. ` +
      `Please run this command from within a workspace (containing launchql.json) ` +
      `or module (containing launchql.plan). Current directory: ${options.cwd}`
    );
  }
  
  if (options.recursive || context === ProjectContext.Workspace) {
    if (!options.projectName) {
      if (context === ProjectContext.Workspace) {
        throw new Error(
          `You are in a workspace root but no projectName was specified. ` +
          `Please specify a projectName or navigate to a specific module directory.`
        );
      } else {
        throw new Error('projectName is required when recursive is true');
      }
    }

    // Use existing verify() from core
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      const availableModules = Object.keys(modules);
      throw new Error(
        `Module "${options.projectName}" not found. ` +
        `Available modules: ${availableModules.length > 0 ? availableModules.join(', ') : 'none'}`
      );
    }
    
    log.info(`Verifying project ${options.projectName} on database ${options.database}...`);
    
    await project.verify(
      getEnvOptions({ 
        pg: { database: options.database }
      }), 
      options.projectName, 
      options.toChange
    );
  } else if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
    const modulePath = project.getModulePath();
    if (!modulePath) {
      throw new Error(`Could not resolve module path from cwd: ${options.cwd}`);
    }
    
    log.info(`Verifying module from ${modulePath} on database ${options.database}...`);
    
    const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
    
    const result = await client.verify({
      modulePath
    });
    
    if (result.failed.length > 0) {
      throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
    }
  } else {
    throw new Error(`Cannot determine operation context from cwd: ${options.cwd}. Context: ${context}`);
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
