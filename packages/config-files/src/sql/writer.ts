import fs from 'fs';
import path from 'path';
import { SqitchRow } from '../types';

export interface SqlWriteOptions {
  outdir: string;
  name: string;
  replacer: (str: string) => string;
  author?: string;
}

/**
 * Write SQL files for Sqitch migrations (deploy, revert, verify)
 */
export const writeSqitchFiles = (rows: SqitchRow[], opts: SqlWriteOptions): void => {
  rows.forEach((row) => writeVerify(row, opts));
  rows.forEach((row) => writeRevert(row, opts));
  rows.forEach((row) => writeDeploy(row, opts));
};

/**
 * Sort dependencies in a consistent order
 */
const ordered = (arr?: string[]): string[] => {
  if (!arr) return [];
  return arr.sort((a, b) => a.length - b.length || a.localeCompare(b));
};

/**
 * Write a deploy SQL file for a Sqitch change
 */
const writeDeploy = (row: SqitchRow, opts: SqlWriteOptions): void => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'deploy');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  const content = `-- Deploy: ${deploy} to pg
-- made with <3 @ launchql.com

${opts.replacer(
    ordered(row?.deps)
      .map((dep) => `-- requires: ${dep}`)
      .join('\n') || ''
  )}

BEGIN;
${opts.replacer(row.content)}
COMMIT;
`;
  fs.writeFileSync(actualFile, content);
};

/**
 * Write a verify SQL file for a Sqitch change
 */
const writeVerify = (row: SqitchRow, opts: SqlWriteOptions): void => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'verify');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  const content = opts.replacer(`-- Verify: ${deploy} on pg

BEGIN;
${opts.replacer(row.verify)}
COMMIT;

`);
  fs.writeFileSync(actualFile, content);
};

/**
 * Write a revert SQL file for a Sqitch change
 */
const writeRevert = (row: SqitchRow, opts: SqlWriteOptions): void => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'revert');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  const content = `-- Revert: ${deploy} from pg

BEGIN;
${opts.replacer(row.revert)}
COMMIT;

`;
  fs.writeFileSync(actualFile, content);
};