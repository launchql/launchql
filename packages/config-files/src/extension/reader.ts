import { readFileSync } from 'fs';
import { parsePlanFileSimple } from '../plan';
import { ExtensionInfo } from './writer';

/**
 * Parse the launchql.plan file to get the extension name.
 */
export const getExtensionName = (packageDir: string): string => {
  const planPath = `${packageDir}/launchql.plan`;
  const plan = parsePlanFileSimple(planPath);
  
  if (!plan.project) {
    throw new Error('No project name found in launchql.plan!');
  }

  return plan.project;
};

/**
 * Get detailed information about an extension in the specified directory.
 */
export const getExtensionInfo = (packageDir: string): ExtensionInfo => {
  const pkgPath = `${packageDir}/package.json`;
  const pkg = require(pkgPath);
  const extname = getExtensionName(packageDir);
  const version = pkg.version;
  const Makefile = `${packageDir}/Makefile`;
  const controlFile = `${packageDir}/${extname}.control`;
  const sqlFile = `sql/${extname}--${version}.sql`;

  return { extname, packageDir, version, Makefile, controlFile, sqlFile };
};

/**
 * Get a list of extensions required by an extension from its control file.
 */
export const getInstalledExtensions = (controlFilePath: string): string[] => {
  try {
    const requiresLine = readFileSync(controlFilePath, 'utf-8')
      .split('\n')
      .find((line) => /^requires/.test(line));

    if (!requiresLine) {
      throw new Error('No "requires" line found in the control file.');
    }

    return requiresLine
      .split('=')[1]
      .split("'")[1]
      .split(',')
      .map((ext) => ext.trim());
  } catch (e) {
    throw new Error('Error parsing "requires" from control file.');
  }
};