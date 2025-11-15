import { existsSync, readFileSync } from 'fs';
import { basename, dirname, relative } from 'path';

import { parsePlanFileSimple } from '../plan';
import { ExtensionInfo } from './writer';

export interface Module {
  path: string;
  requires: string[];
  version: string;
}

/**
 * Parse a .control file and extract its metadata.
 * https://www.postgresql.org/docs/current/extend-extensions.html
 */
export function parseControlFile(filePath: string, basePath: string): Module {
  const contents = readFileSync(filePath, 'utf-8');
  const key = basename(filePath).split('.control')[0];
  const requires = contents
    .split('\n')
    .find((line) => /^requires/.test(line))
    ?.split('=')[1]
    .split(',')
    .map((req) => req.replace(/[\'\s]*/g, '').trim()) || [];

  const version = contents
    .split('\n')
    .find((line) => /^default_version/.test(line))
    ?.split('=')[1]
    .replace(/[\']*/g, '')
    .trim() || '';

  return {
    path: dirname(relative(basePath, filePath)),
    requires,
    version,
  };
}

/**
 * Resolve the plan file path, checking for both pgpm.plan and launchql.plan (for backward compatibility).
 * Prefers pgpm.plan if both exist.
 */
const resolvePlanPath = (packageDir: string): string => {
  const pgpmPlan = `${packageDir}/pgpm.plan`;
  const launchqlPlan = `${packageDir}/launchql.plan`;
  
  if (existsSync(pgpmPlan)) {
    return pgpmPlan;
  }
  
  if (existsSync(launchqlPlan)) {
    return launchqlPlan;
  }
  
  throw new Error(`No plan file found in ${packageDir}. Expected pgpm.plan or launchql.plan`);
};

/**
 * Parse the plan file to get the extension name.
 * Supports both pgpm.plan (new) and launchql.plan (legacy) for backward compatibility.
 */
export const getExtensionName = (packageDir: string): string => {
  const planPath = resolvePlanPath(packageDir);
  const plan = parsePlanFileSimple(planPath);
  
  if (!plan.package) {
    throw new Error(`No package name found in plan file: ${planPath}`);
  }

  return plan.package;
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
