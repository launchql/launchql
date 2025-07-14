import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Read a SQL script file, return empty string if not found
 */
export function readScript(basePath: string, scriptType: string, changeName: string): string {
  const scriptPath = join(basePath, scriptType, `${changeName}.sql`);
  
  if (!existsSync(scriptPath)) {
    return '';
  }
  
  return readFileSync(scriptPath, 'utf-8');
}

/**
 * Check if a script file exists
 */
export function scriptExists(basePath: string, scriptType: string, changeName: string): boolean {
  const scriptPath = join(basePath, scriptType, `${changeName}.sql`);
  return existsSync(scriptPath);
}