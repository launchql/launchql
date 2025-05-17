import path from 'path';
import fs from 'fs';
import { run } from '../src';

export function runSQLFile(file: string, database: string): void {
  const filePath = path.resolve(__dirname, '../sql', file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing SQL file: ${file}`);
  run(`psql -f ${filePath} ${database}`);
}
