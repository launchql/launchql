import { getEnvOptions } from '@pgpmjs/env';
import fs from 'fs';
import path from 'path';

import { SqitchRow } from '../types';

export interface SqlWriteOptions {
  outdir: string;
  name: string;
  replacer: (str: string) => string;
  author?: string;
  useTx?: boolean;
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
  const globalOpts = getEnvOptions({
    migrations: {
      codegen: {
        useTx: opts.useTx
      }
    }
  });
  const useTx = globalOpts.migrations.codegen.useTx;
  
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'deploy');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  
  const sqlContent = opts.replacer(row.content);
  
  const content = `-- Deploy: ${deploy}
-- made with <3 @ constructive.io

${opts.replacer(
    ordered(row?.deps)
      .map((dep) => `-- requires: ${dep}`)
      .join('\n') || ''
  )}

${useTx ? 'BEGIN;' : ''}
${sqlContent}
${useTx ? 'COMMIT;' : ''}
`;
  fs.writeFileSync(actualFile, content);
};

/**
 * Write a verify SQL file for a Sqitch change
 */
const writeVerify = (row: SqitchRow, opts: SqlWriteOptions): void => {
  const globalOpts = getEnvOptions({
    migrations: {
      codegen: {
        useTx: opts.useTx
      }
    }
  });
  const useTx = globalOpts.migrations.codegen.useTx;
  
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'verify');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  
  const sqlContent = opts.replacer(row.verify);
  
  const content = opts.replacer(`-- Verify: ${deploy}

${useTx ? 'BEGIN;' : ''}
${sqlContent}
${useTx ? 'COMMIT;' : ''}

`);
  fs.writeFileSync(actualFile, content);
};

/**
 * Write a revert SQL file for a Sqitch change
 */
const writeRevert = (row: SqitchRow, opts: SqlWriteOptions): void => {
  const globalOpts = getEnvOptions({
    migrations: {
      codegen: {
        useTx: opts.useTx
      }
    }
  });
  const useTx = globalOpts.migrations.codegen.useTx;
  
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = path.join(opts.outdir, opts.name, 'revert');
  const actualDir = path.resolve(prefix, dir);
  const actualFile = path.resolve(prefix, `${deploy}.sql`);
  fs.mkdirSync(actualDir, { recursive: true });
  
  const sqlContent = opts.replacer(row.revert);
  
  const content = `-- Revert: ${deploy}

${useTx ? 'BEGIN;' : ''}
${sqlContent}
${useTx ? 'COMMIT;' : ''}

`;
  fs.writeFileSync(actualFile, content);
};
