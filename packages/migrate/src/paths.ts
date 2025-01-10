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
  if (process.env.SQITCH_PATH) {
    return process.env.SQITCH_PATH;
  }
  return walkUp(cwd, PROJECT_FILES.SQITCH);
};

/**
 * Finds the LaunchQL project path.
 * @param cwd - Current working directory.
 * @returns A promise that resolves to the directory path containing `launchql.json`.
 */
export const launchqlPath = async (cwd: string = process.cwd()): Promise<string> => {
  if (process.env.LAUNCHQL_PATH) {
    return process.env.LAUNCHQL_PATH;
  }
  return walkUp(cwd, PROJECT_FILES.LAUNCHQL);
};
