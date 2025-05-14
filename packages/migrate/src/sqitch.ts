import fs from 'fs';
import path from 'path';

export interface SqitchRow {
  deploy: string;
  revert?: string;
  verify?: string;
  content: string;
  deps?: string[];
  name?: string;
}

interface WriteOptions {
  outdir: string;
  name: string;
  replacer: (str: string) => string;
}

export const writeSqitchFiles = (rows: SqitchRow[], opts: WriteOptions): void => {
  rows.forEach((row) => writeVerify(row, opts));
  rows.forEach((row) => writeRevert(row, opts));
  rows.forEach((row) => writeDeploy(row, opts));
};

const ordered = (arr?: string[]): string[] => {
  if (!arr) return [];
  return arr.sort((a, b) => a.length - b.length || a.localeCompare(b));
};

const writeDeploy = (row: SqitchRow, opts: WriteOptions): void => {
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

const writeVerify = (row: SqitchRow, opts: WriteOptions): void => {
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

const writeRevert = (row: SqitchRow, opts: WriteOptions): void => {
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

export const writeSqitchPlan = (rows: SqitchRow[], opts: WriteOptions): void => {
  const dir = path.resolve(path.join(opts.outdir, opts.name));
  fs.mkdirSync(dir, { recursive: true });

  const date = (): string => '2017-08-11T08:11:51Z'; // stubbed timestamp

  const duplicates: Record<string, boolean> = {};

  const plan = opts.replacer(`%syntax-version=1.0.0
%project=launchql-extension-name
%uri=launchql-extension-name

${rows
    .map((row) => {
      if (duplicates[row.deploy]) {
        console.log('DUPLICATE ' + row.deploy);
        return '';
      }
      duplicates[row.deploy] = true;

      if (row.deps?.length) {
        return `${row.deploy} [${row.deps.join(' ')}] ${date()} launchql <launchql@5b0c196eeb62> # add ${row.name}`;
      }
      return `${row.deploy} ${date()} launchql <launchql@5b0c196eeb62> # add ${row.name}`;
    })
    .join('\n')}
`);

  fs.writeFileSync(path.join(dir, 'sqitch.plan'), plan);
};