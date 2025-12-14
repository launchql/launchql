import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { errors } from '@pgpmjs/types';

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

  throw errors.FILE_NOT_FOUND({ filePath: filename, type: 'configuration' });
};

export const sluggify = (text: string): string => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};
