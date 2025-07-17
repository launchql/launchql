import { LaunchQLProject } from '../class/launchql';
import { LaunchQLOptions } from '@launchql/types';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { executeDeployStrategy, executeRevertStrategy, executeVerifyStrategy, StrategyOptions } from './strategies';
import { deploy as deployProject } from './projects/deploy';
import { revert as revertProject } from './projects/revert';
import { verify as verifyProject } from './projects/verify';

const log = new Logger('project-commands');

export interface MigrationOptions extends StrategyOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;
}

export async function deploy(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Project "${options.projectName}" not found in modules`);
    }

    const modulePath = project.modulePath;
    
    await deployProject(
      getPgEnvOptions(), 
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

export async function revert(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Project "${options.projectName}" not found in modules`);
    }

    await revertProject(
      getPgEnvOptions(), 
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

export async function verify(options: MigrationOptions): Promise<void> {
  if (options.recursive) {
    if (!options.projectName) {
      throw new Error('projectName is required when recursive is true');
    }

    const project = new LaunchQLProject(options.cwd);
    const modules = project.getModuleMap();
    
    if (!modules[options.projectName]) {
      throw new Error(`Project "${options.projectName}" not found in modules`);
    }

    await verifyProject(
      getPgEnvOptions(), 
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

export async function getModuleNames(cwd: string): Promise<string[]> {
  const project = new LaunchQLProject(cwd);
  const modules = await project.getModules();
  return modules.map(mod => mod.getModuleName());
}

export const deployModules = deploy;
export const revertModules = revert;
export const verifyModules = verify;
