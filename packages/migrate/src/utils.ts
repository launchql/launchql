import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';

/**
 * Recursively walks up directories to find a specific file.
 * @param startDir - Starting directory.
 * @param filename - The target file to search for.
 * @returns A promise that resolves to the directory path containing the file.
 */
export const walkUp = async (startDir: string, filename: string): Promise<string> => {
  let currentDir = resolve(startDir);
  
  while (currentDir) {
    const targetPath = resolve(currentDir, filename);
    try {
      await fs.access(targetPath);
      return currentDir;
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
  }
  
  throw new Error(`File "${filename}" not found in any parent directories.`);
};