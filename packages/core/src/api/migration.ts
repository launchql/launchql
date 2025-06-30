import { LaunchQLProject } from '../class/launchql';
import { deploy } from '../sqitch/deploy';
import { revert } from '../sqitch/revert';
import { verify } from '../sqitch/verify';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { deployCommand } from '../migrate/deploy-command';
import { revertCommand } from '../migrate/revert-command';
import { verifyCommand } from '../migrate/verify-command';
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
}

/**
 * Deploy a project - handles both recursive (multi-module) and non-recursive (single directory) deployments
 */
export async function deployWithOptions(options: MigrationOptions): Promise<void> {
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
    
    await deploy(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      modulePath, 
      { 
        useSqitch: options.useSqitch, 
        useTransaction: options.useTransaction 
      }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('deploy', options.database, options.cwd);
    } else {
      await deployCommand(
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
export async function revertWithOptions(options: MigrationOptions): Promise<void> {
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
    
    await revert(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      { 
        useSqitch: options.useSqitch, 
        useTransaction: options.useTransaction 
      }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('revert', options.database, options.cwd);
    } else {
      await revertCommand(
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
export async function verifyWithOptions(options: MigrationOptions): Promise<void> {
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
    
    await verify(
      getEnvOptions({ pg: { database: options.database } }), 
      options.projectName, 
      options.database, 
      options.cwd, 
      { useSqitch: options.useSqitch }
    );
  } else {
    // Direct execution on current directory
    if (options.useSqitch) {
      await runSqitch('verify', options.database, options.cwd);
    } else {
      await verifyCommand(
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