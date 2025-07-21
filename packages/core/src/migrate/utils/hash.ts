import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { parse } from 'pgsql-parser';

import { cleanTree } from '../../packaging/package';

/**
 * Generate SHA256 hash of a file's contents
 */
export async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generate SHA256 hash of a string
 */
export function hashString(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generate SHA256 hash of a SQL file's parsed and cleaned AST
 */
export async function hashSqlFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8');
  const parsed = await parse(content);
  const cleaned = cleanTree(parsed);
  const astString = JSON.stringify(cleaned);
  return hashString(astString);
}
