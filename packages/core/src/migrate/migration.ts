import { LaunchQLProject } from '../class/launchql';
import { deployProject } from '../projects/deploy-project';
import { revertProject } from '../projects/revert-project';
import { verifyProject } from '../projects/verify-project';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { deployModule } from './deploy-module';
import { revertModule } from './revert-module';
import { verifyModule } from './verify-module';
import { runSqitch } from '../utils/sqitch-wrapper';

const log = new Logger('project-commands');

export interface MigrationOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;  // Required if recursive=true
  useSqitch?: boolean;
  useTransaction?: boolean;
  toChange?: string;
  // Options for fast deployment
  fast?: boolean;
  usePlan?: boolean;
  cache?: boolean;
  /**
   * The plan file to use for sqitch operations
   * Defaults to 'launchql.plan'
   */
  planFile?: string;
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
    
    await deployProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      modulePath, 
      { 
        useSqitch: options.useSqitch, 
        useTransaction: options.useTransaction,
        fast: options.fast,
        usePlan: options.usePlan,
        cache: options.cache,
        planFile: options.planFile,
        toChange: options.toChange
      }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('deploy', options.database, options.cwd, getPgEnvOptions(), {
        planFile: options.planFile,
        args: options.toChange ? [options.toChange] : []
      });
    } else {
      await deployModule(
        getPgEnvOptions(), 
        options.database, 
        options.cwd, 
        { 
          useTransaction: options.useTransaction, 
          toChange: options.toChange 
        }
      );
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
    
    await revertProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      { 
        useSqitch: options.useSqitch, 
        useTransaction: options.useTransaction,
        planFile: options.planFile,
        toChange: options.toChange
      }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('revert', options.database, options.cwd, getPgEnvOptions(), {
        planFile: options.planFile,
        confirm: true,
        args: options.toChange ? [options.toChange] : []
      });
    } else {
      await revertModule(
        getPgEnvOptions(), 
        options.database, 
        options.cwd, 
        { 
          useTransaction: options.useTransaction, 
          toChange: options.toChange 
        }
      );
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
    
    await verifyProject(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      { 
        useSqitch: options.useSqitch,
        planFile: options.planFile
      }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('verify', options.database, options.cwd, getPgEnvOptions(), {
        planFile: options.planFile
      });
    } else {
      await verifyModule(
        getPgEnvOptions(), 
        options.database, 
        options.cwd
      );
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