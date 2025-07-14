import { readFileSync } from 'fs';
import { getChanges } from '@launchql/project-files';

import { getDeps } from './deps';
import { getExtensionName } from '@launchql/project-files';

/**
 * Resolves SQL scripts for deployment or reversion.
 *
 * @param pkgDir - The package directory (defaults to the current working directory).
 * @param scriptType - The type of script to resolve (`deploy` or `revert`).
 * @returns A single concatenated SQL script as a string.
 */
export const resolve = (
  pkgDir: string = process.cwd(),
  scriptType: 'deploy' | 'revert' = 'deploy'
): string => {
  const sqlfile: string[] = [];
  const name = getExtensionName(pkgDir);
  const { resolved, external } = getDeps(pkgDir, name);

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
 * Resolves SQL scripts based on the `launchql.plan` file.
 *
 * @param pkgDir - The package directory (defaults to the current working directory).
 * @param scriptType - The type of script to resolve (`deploy` or `revert`).
 * @returns A single concatenated SQL script as a string.
 */
export const resolveWithPlan = (
  pkgDir: string = process.cwd(),
  scriptType: 'deploy' | 'revert' = 'deploy'
): string => {
  const sqlfile: string[] = [];
  const planPath = `${pkgDir}/launchql.plan`;
  
  let resolved = getChanges(planPath);

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
