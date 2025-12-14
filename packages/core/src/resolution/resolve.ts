import { readFileSync } from 'fs';

import { getChanges, getExtensionName } from '../files';
import { parsePlanFile } from '../files/plan/parser';
import { resolveDependencies } from './deps';
import { errors } from '@pgpmjs/types';

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
  const { resolved, external } = resolveDependencies(pkgDir, name, { tagResolution: 'resolve' });

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
 * Resolves SQL scripts based on the `pgpm.plan` file.
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
  const planPath = `${pkgDir}/pgpm.plan`;
  
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

/**
 * Resolves a tag reference to its corresponding change name.
 * Tags provide a way to reference specific points in a package's deployment history.
 * 
 * @param planPath - Path to the plan file containing tag definitions
 * @param tagReference - The tag reference to resolve (e.g., "package:@tagName" or "@tagName")
 * @param currentPackage - The current package name (used when tag doesn't specify package)
 * @returns The resolved change name
 * @throws Error if tag format is invalid or tag is not found
 * 
 * @example
 * // Resolve a tag in the current package
 * resolveTagToChangeName('/path/to/pgpm.plan', '@v1.0.0', 'mypackage')
 * // Returns: 'schema/v1'
 * 
 * @example
 * // Resolve a tag from another package
 * resolveTagToChangeName('/path/to/pgpm.plan', 'auth:@v2.0.0')
 * // Returns: 'users/table'
 */
export const resolveTagToChangeName = (
  planPath: string, 
  tagReference: string, 
  currentProject?: string
): string => {
  // If not a tag reference, return as-is
  if (!tagReference.includes('@')) {
    return tagReference;
  }
  
  // Handle simple tag format (@tagName) by prepending current package
  if (tagReference.startsWith('@') && !tagReference.includes(':')) {
    if (!currentProject) {
      const plan = parsePlanFile(planPath);
      if (!plan.data) {
        throw errors.PLAN_PARSE_ERROR({ planPath, errors: 'Could not parse plan file' });
      }
      currentProject = plan.data.package;
    }
    tagReference = `${currentProject}:${tagReference}`;
  }
  
  // Parse package:@tagName format
  const match = tagReference.match(/^([^:]+):@(.+)$/);
  if (!match) {
    throw errors.INVALID_NAME({ name: tagReference, type: 'tag', rules: 'Expected format: package:@tagName or @tagName' });
  }
  
  const [, projectName, tagName] = match;
  
  // Parse plan file to find tag
  const planResult = parsePlanFile(planPath);
  
  if (!planResult.data) {
    throw errors.PLAN_PARSE_ERROR({ planPath, errors: 'Could not parse plan file' });
  }
  
  // Find the tag in the plan
  const tag = planResult.data.tags?.find((t: any) => t.name === tagName);
  if (!tag) {
    throw errors.TAG_NOT_FOUND({ tag: tagName, project: projectName });
  }
  
  return tag.change;
};
