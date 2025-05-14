import { walkUp } from './utils';


const PROJECT_FILES = {
  SQITCH: 'sqitch.conf',
  LAUNCHQL: 'launchql.json',
};

/**
 * Finds the Sqitch project path.
 * @param cwd - Current working directory.
 * @returns A promise that resolves to the directory path containing `sqitch.conf`.
 */
export const sqitchPath = (cwd: string = process.cwd()): string => {
  return walkUp(cwd, PROJECT_FILES.SQITCH);
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
    pkgPath = sqitchPath(cwd);
  } catch (err) {
    console.error('Error: You must be in a LaunchQL module. You can initialize one with the `init` command.');
    process.exit(1);
  }

  return pkgPath;
};
