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
export const sqitchPath = async (cwd: string = process.cwd()): Promise<string> => {
  return walkUp(cwd, PROJECT_FILES.SQITCH);
};

/**
 * Finds the LaunchQL project path.
 * @param cwd - Current working directory.
 * @returns A promise that resolves to the directory path containing `launchql.json`.
 */
export const launchqlPath = async (cwd: string = process.cwd()): Promise<string> => {
  return walkUp(cwd, PROJECT_FILES.LAUNCHQL);
};

export const getWorkspacePath = async (cwd: string): Promise<string> => {
  let workspacePath: string;

  try {
    workspacePath = await launchqlPath(cwd);
  } catch (err) {
    console.error('Error: You must be in a LaunchQL workspace. You can initialize one with the `--workspace` option.');
    process.exit(1);
  }

  return workspacePath;
};
