import { walkUp } from './utils';


const PROJECT_FILES = {
  PLAN: 'launchql.plan',
  LAUNCHQL: 'launchql.json',
};

/**
 * Finds the module path by looking for launchql.plan.
 * @param cwd - Current working directory.
 * @returns A promise that resolves to the directory path containing `launchql.plan`.
 */
export const modulePath = (cwd: string = process.cwd()): string => {
  return walkUp(cwd, PROJECT_FILES.PLAN);
};

/**
 * Finds the LaunchQL project path.
 * @param cwd - Current working directory.
 * @returns A promise that resolves to the directory path containing `launchql.json`.
 */
export const launchqlPath = (cwd: string = process.cwd()): string => {
  return walkUp(cwd, PROJECT_FILES.LAUNCHQL);
};

export const getWorkspacePath = (cwd: string): string => {
  let workspacePath: string;

  try {
    workspacePath = launchqlPath(cwd);
  } catch (err) {
    console.error('Error: You must be in a LaunchQL workspace. You can initialize one with the `--workspace` option.');
    process.exit(1);
  }

  return workspacePath;
};

export const getModulePath = (cwd: string): string => {
  let pkgPath: string;

  try {
    pkgPath = modulePath(cwd);
  } catch (err) {
    console.error('Error: You must be in a LaunchQL module. You can initialize one with the `init` command.');
    process.exit(1);
  }

  return pkgPath;
};
