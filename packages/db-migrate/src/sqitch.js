import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export const writeSqitchFiles = (rows, opts) => {
  rows.forEach((row) => writeVerify(row, opts));
  rows.forEach((row) => writeRevert(row, opts));
  rows.forEach((row) => writeDeploy(row, opts));
};

const ordered = (arr) => {
  if (!arr) return [];
  return arr.sort((a, b) => {
    return (
      a.length - b.length || a.localeCompare(b) // sort by length, if equal then
    ); // sort by dictionary order
  });
};

const writeDeploy = (row, opts) => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = opts.outdir + opts.name + '/deploy/';
  const actualDir = path.resolve(prefix + dir);
  const actualFile = path.resolve(prefix + deploy + '.sql');
  mkdirp.sync(actualDir);
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
const writeVerify = (row, opts) => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = opts.outdir + opts.name + '/verify/';
  const actualDir = path.resolve(prefix + dir);
  const actualFile = path.resolve(prefix + deploy + '.sql');
  mkdirp.sync(actualDir);
  const content = opts.replacer(`-- Verify: ${deploy} on pg

BEGIN;
${opts.replacer(row.verify)}
COMMIT;  

`);
  fs.writeFileSync(actualFile, content);
};

const writeRevert = (row, opts) => {
  const deploy = opts.replacer(row.deploy);
  const dir = path.dirname(deploy);
  const prefix = opts.outdir + opts.name + '/revert/';
  const actualDir = path.resolve(prefix + dir);
  const actualFile = path.resolve(prefix + deploy + '.sql');
  mkdirp.sync(actualDir);
  const content = `-- Revert: ${deploy} from pg

BEGIN;
${opts.replacer(row.revert)}
COMMIT;  

`;
  fs.writeFileSync(actualFile, content);
};

export const writeSqitchPlan = (rows, opts) => {
  const dir = path.resolve(opts.outdir + opts.name);
  mkdirp.sync(dir);
  const date = () => `2017-08-11T08:11:51Z`;
  // TODO timestamp issue
  //   const date = row => moment(row.created_at).format();
  const duplicates = {};
  const plan = opts.replacer(`%syntax-version=1.0.0
%project=launchql-extension-name
%uri=launchql-extension-name

${rows
  .map((row) => {
    if (duplicates.hasOwnProperty(row.deploy)) {
      console.log('DUPLICATE ' + row.deploy);
      return '';
    } else {
      duplicates[row.deploy] = true;
    }
    if (row.deps?.length > 0) {
      return `${row.deploy} [${row.deps.map((dep) => dep).join(' ')}] ${date(
        row
      )} launchql <launchql@5b0c196eeb62> # add ${row.name}`;
    }
    return `${row.deploy} ${date(row)} launchql <launchql@5b0c196eeb62> # add ${
      row.name
    }`;
  })
  .join('\n')}
`);

  fs.writeFileSync(dir + '/sqitch.plan', plan);
};
