import fs from 'fs';
import { sync as globSync } from 'glob';
import path from 'path';

/**
 * Extract variable names from a string using the __VARNAME__ pattern
 * @param content - String content to scan for variables
 * @returns Set of variable names (without the __ delimiters)
 */
export function extractVarNamesFromString(content: string): Set<string> {
  const varPattern = /__([A-Z0-9_]+)__/g;
  const matches = content.matchAll(varPattern);
  const varNames = new Set<string>();
  
  for (const match of matches) {
    varNames.add(match[1]);
  }
  
  return varNames;
}

/**
 * Extract all variable names from a directory by scanning file contents and file paths
 * @param dir - Directory path to scan
 * @returns Set of variable names (without the __ delimiters)
 */
export function extractVarNamesFromDir(dir: string): Set<string> {
  const IGNORE = ['.DS_Store', '.questions.json'];
  
  const files = [
    ...globSync('**/*', { cwd: dir, nodir: true }),
    ...globSync('**/.*', { cwd: dir, nodir: true }),
  ].filter(f => !IGNORE.includes(path.basename(f)));
  
  const allVarNames = new Set<string>();
  
  for (const relPath of files) {
    const pathVars = extractVarNamesFromString(relPath);
    pathVars.forEach(v => allVarNames.add(v));
    
    const fullPath = path.join(dir, relPath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const contentVars = extractVarNamesFromString(content);
      contentVars.forEach(v => allVarNames.add(v));
    } catch (error) {
    }
  }
  
  return allVarNames;
}
