import { PgpmPackage } from '@pgpmjs/core';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PackageAliasMap {
  [npmName: string]: string;
}

/**
 * Build a map of npm package names to control file names (extension names).
 * This allows users to reference packages by their npm name (e.g., @scope/my-module)
 * instead of the control file name (e.g., my-module).
 */
export function buildPackageAliasMap(cwd: string): PackageAliasMap {
  const aliasMap: PackageAliasMap = {};
  
  try {
    const pkg = new PgpmPackage(cwd);
    const workspacePath = pkg.getWorkspacePath();
    
    if (!workspacePath) {
      return aliasMap;
    }
    
    const modules = pkg.getModuleMap();
    
    for (const [controlName, moduleInfo] of Object.entries(modules)) {
      const modulePath = join(workspacePath, moduleInfo.path);
      const packageJsonPath = join(modulePath, 'package.json');
      
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          const npmName = packageJson.name;
          
          if (npmName && npmName !== controlName) {
            aliasMap[npmName] = controlName;
          }
        } catch {
          // Skip modules with invalid package.json
        }
      }
    }
  } catch {
    // Return empty map if we can't access workspace
  }
  
  return aliasMap;
}

/**
 * Resolve a package name that might be an npm alias to its control file name.
 * If the input is already a control file name or not found in aliases, returns as-is.
 * 
 * @param input - The package name (could be npm name like @scope/pkg or control name)
 * @param cwd - The current working directory
 * @returns The resolved control file name
 */
export function resolvePackageAlias(input: string, cwd: string): string {
  if (!input) {
    return input;
  }
  
  const aliasMap = buildPackageAliasMap(cwd);
  return aliasMap[input] ?? input;
}

/**
 * Get the npm package name for a given control file name, if available.
 * Returns undefined if no npm alias exists.
 * 
 * @param controlName - The control file name (extension name)
 * @param cwd - The current working directory
 * @returns The npm package name or undefined
 */
export function getNpmNameForControl(controlName: string, cwd: string): string | undefined {
  const aliasMap = buildPackageAliasMap(cwd);
  
  for (const [npmName, ctrlName] of Object.entries(aliasMap)) {
    if (ctrlName === controlName) {
      return npmName;
    }
  }
  
  return undefined;
}

/**
 * Format a module name for display, showing both control name and npm alias if available.
 * Example: "my-module (@scope/my-module)" or just "my-module" if no alias
 * 
 * @param controlName - The control file name
 * @param cwd - The current working directory
 * @returns Formatted display string
 */
export function formatModuleNameWithAlias(controlName: string, cwd: string): string {
  const npmName = getNpmNameForControl(controlName, cwd);
  
  if (npmName) {
    return `${controlName} (${npmName})`;
  }
  
  return controlName;
}
