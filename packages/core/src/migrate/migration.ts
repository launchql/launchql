import { LaunchQLProject } from '../core/class/launchql';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';


export interface MigrationOptions {
  database: string;
  cwd: string;
  /** Whether to perform recursive deployment across module dependencies. Defaults to auto-detection based on context. */
  recursive?: boolean;
  /** Required when recursive=true. The name of the project/module to deploy. */
  projectName?: string;
  /** Whether to wrap operations in a database transaction. */
  useTransaction?: boolean;
  /** Deploy/revert up to this specific change or tag. */
  toChange?: string;
  // Options for fast deployment
  /** Enable fast deployment strategy using caching. */
  fast?: boolean;
  /** Use Sqitch plan files for deployment. */
  usePlan?: boolean;
  /** Enable deployment package caching. */
  cache?: boolean;
}

/**
 * Deploy a project - handles both recursive (multi-module) and non-recursive (single directory) deployments
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function deployModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database: options.database }),
    deployment: {
      useTx: options.useTransaction,
      fast: options.fast,
      usePlan: options.usePlan,
      cache: options.cache,
      toChange: options.toChange
    }
  });
  
  try {
    await project.deploy(
      opts,
      options.projectName,
      options.toChange,
      options.recursive
    );
  } catch (error) {
    throw new Error(`Deployment failed: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Revert a project - handles both recursive (multi-module) and non-recursive (single directory) reverts
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function revertModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database: options.database }),
    deployment: {
      useTx: options.useTransaction,
      toChange: options.toChange
    }
  });
  
  try {
    await project.revert(
      opts,
      options.projectName,
      options.toChange,
      options.recursive
    );
  } catch (error) {
    throw new Error(`Revert failed: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Verify a project - handles both recursive (multi-module) and non-recursive (single directory) verification
 * Now with enhanced path resolution similar to LaunchQLProject
 */
export async function verifyModules(options: MigrationOptions): Promise<void> {
  const project = new LaunchQLProject(options.cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database: options.database })
  });
  
  try {
    await project.verify(
      opts,
      options.projectName,
      options.toChange,
      options.recursive
    );
  } catch (error) {
    throw new Error(`Verification failed: ${error instanceof Error ? error.message : error}`);
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
