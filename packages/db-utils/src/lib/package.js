import { sqitchPath as path } from './paths';
import { getExtensionName } from './extensions';
import { parse, deparse } from 'pgsql-parser';
import { resolve, resolveWithPlan } from './resolve';
import { sync as mkdirp } from 'mkdirp';
import { relative } from 'path';
import { transformProps } from '@launchql/db-transform';
import { writeFileSync, readFileSync } from 'fs';
import { sync as rimraf } from 'rimraf';

const noop = () => undefined;

export const cleanTree = (tree) => {
  return transformProps(tree, {
    stmt_len: noop,
    stmt_location: noop,
    location: noop
  });
};

// default to using the plan, so we stay in sync with the actual order that was developed in code
export const packageModule = async ({
  usePlan = true,
  extension = true
} = {}) => {
  const sqitchPath = await path();
  const resolveFn = usePlan ? resolveWithPlan : resolve;
  const sql = await resolveFn(sqitchPath);
  const extname = await getExtensionName(sqitchPath);

  // sql
  try {
    const parsed = parse(sql);
    const stmts = parsed.stmts.reduce((m, s) => {
      if (extension) {
        if (s.stmt.hasOwnProperty('TransactionStmt')) return m;
        if (s.stmt.hasOwnProperty('CreateExtensionStmt')) return m;
      }

      return [...m, s];
    }, []);
    const topLine = extension
      ? `\\echo Use "CREATE EXTENSION ${extname}" to load this file. \\quit\n`
      : '';
    const finalSql = deparse({ stmts });
    const tree1 = { version: parsed.version, stmts };
    const tree2 = parse(finalSql);
    const results = {
      sql: `${topLine}${finalSql}`
    };
    const diff =
      JSON.stringify(cleanTree(tree1)) !== JSON.stringify(cleanTree(tree2));
    if (diff) {
      results.diff = true;
      results.tree1 = JSON.stringify(cleanTree(tree1), null, 2);
      results.tree2 = JSON.stringify(cleanTree(tree2), null, 2);
    }

    return results;
  } catch (e) {
    console.error(e);
  }
};

export const writePackage = async ({
  version,
  extension = true,
  usePlan = true,
  sqitchPath
}) => {
  if (!sqitchPath) {
    sqitchPath = await path();
  }
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);
  const extname = await getExtensionName(sqitchPath);
  const makePath = `${sqitchPath}/Makefile`;
  const controlPath = `${sqitchPath}/${extname}.control`;
  const sqlFileName = `${extname}--${version}.sql`;

  const Makefile = readFileSync(makePath).toString();
  const control = readFileSync(controlPath).toString();

  const { sql, diff, tree1, tree2 } = await packageModule({
    extension,
    usePlan
  });

  const outPath = extension ? `${sqitchPath}/sql` : `${sqitchPath}/out`;

  rimraf(outPath);
  mkdirp(outPath);

  if (extension) {
    // control file
    writeFileSync(
      controlPath,
      control.replace(
        /default_version = '[0-9\.]+'/,
        `default_version = '${version}'`
      )
    );

    // package json
    pkg.version = version;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // makefile
    var regex = new RegExp(extname + '--[0-9.]+.sql');
    writeFileSync(makePath, Makefile.replace(regex, sqlFileName));
  }

  if (diff) {
    console.error(
      `DIFF exists! Careful. Check ${relative(sqitchPath, outPath)}/ folder...`
    );
    // writeFileSync(`${outPath}/orig.${sqlFileName}.tree.json`, tree1);
    // writeFileSync(`${outPath}/parsed.${sqlFileName}.tree.json`, tree2);
  }

  const writePath = `${outPath}/${sqlFileName}`;
  writeFileSync(writePath, sql);
  console.log(`${relative(sqitchPath, writePath)} written`);
};
