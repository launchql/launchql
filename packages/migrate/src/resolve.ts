import { readFileSync } from 'fs';

import { getDeps } from './deps';
import { getExtensionName } from './extensions';

/**
 * Resolves SQL scripts for deployment or reversion.
 *
 * @param pkgDir - The package directory (defaults to the current working directory).
 * @param scriptType - The type of script to resolve (`deploy` or `revert`).
 * @returns A single concatenated SQL script as a string.
 */
export const resolve = async (
  pkgDir: string = process.cwd(),
  scriptType: 'deploy' | 'revert' = 'deploy'
): Promise<string> => {
  const sqlfile: string[] = [];
  const name = getExtensionName(pkgDir);
  const { resolved, external } = await getDeps(pkgDir, name);

  const scripts = scriptType === 'revert' ? [...resolved].reverse() : resolved;

  for (const script of scripts) {
    if (external.includes(script)) continue;
    const file = `${pkgDir}/${scriptType}/${script}.sql`;
    const dscript = readFileSync(file, 'utf-8');
    sqlfile.push(dscript);
  }

  return sqlfile.join('\n');
};

/**
 * Resolves SQL scripts based on the `sqitch.plan` file.
 *
 * @param pkgDir - The package directory (defaults to the current working directory).
 * @param scriptType - The type of script to resolve (`deploy` or `revert`).
 * @returns A single concatenated SQL script as a string.
 */
export const resolveWithPlan = async (
  pkgDir: string = process.cwd(),
  scriptType: 'deploy' | 'revert' = 'deploy'
): Promise<string> => {
  const sqlfile: string[] = [];
  const plan = readFileSync(`${pkgDir}/sqitch.plan`, 'utf-8');

  let resolved = plan
    .split('\n')
    .filter(
      (line) =>
        line.trim().length > 0 && // Exclude empty lines
        !line.trim().startsWith('%') && // Exclude initial project settings
        !line.trim().startsWith('@') // Exclude tags
    )
    .map((line) => line.split(' ')[0]);

  if (scriptType === 'revert') {
    resolved = resolved.reverse();
  }

  for (const script of resolved) {
    const file = `${pkgDir}/${scriptType}/${script}.sql`;
    const dscript = readFileSync(file, 'utf-8');
    sqlfile.push(dscript);
  }

  return sqlfile.join('\n');
};
