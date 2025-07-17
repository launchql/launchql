import { createHash } from 'crypto';
import { readFileSync } from 'fs';

/**
 * Generate SHA256 hash of a file's contents
 */
export function hashFile(filePath: string): string {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generate SHA256 hash of a string
 */
export function hashString(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
