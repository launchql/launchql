import { existsSync } from 'fs';
import { dirname, resolve } from 'path';

/**
 * Recursively walks up directories to find a specific file (sync version).
 * @param startDir - Starting directory.
 * @param filename - The target file to search for.
 * @returns The directory path containing the file.
 */
export const walkUp = (startDir: string, filename: string): string => {
  let currentDir = resolve(startDir);

  while (currentDir) {
    const targetPath = resolve(currentDir, filename);
    if (existsSync(targetPath)) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  throw new Error(`File "${filename}" not found in any parent directories.`);
};