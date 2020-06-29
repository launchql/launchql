import { sqitchPath as path } from './paths';
const parser = require('pgsql-parser');
import { resolve } from './resolve';
import { sync as mkdirp } from 'mkdirp';
import { relative } from 'path';
import { transformProps } from '@launchql/db-transform';
import { writeFileSync, readFileSync } from 'fs';
import  { sluggify } from './utils';

const noop = () => undefined;

export const cleanTree = (tree) => {
  return transformProps(tree, {
    stmt_len: noop,
    stmt_location: noop,
    location: noop
  });
};

export const packageModule = async (extension=true) => {
  const sqitchPath = await path();
  const sql = await resolve(sqitchPath);
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);
  const extname = sluggify(pkg.name);

  // sql
  try {
    const query = parser.parse(sql).query.reduce((m, stmt)=>{
      if (extension) {
        if (stmt.RawStmt.stmt.hasOwnProperty('TransactionStmt')) return m;
        if (stmt.RawStmt.stmt.hasOwnProperty('CreateExtensionStmt')) return m;
      }
      return [...m, stmt];
    }, []);
    const topLine = extension ? `\\echo Use "CREATE EXTENSION ${extname}" to load this file. \\quit\n` : '';
    const finalSql = parser.deparse(query);
    const tree1 = query;
    const tree2 = parser.parse(finalSql).query;
    const results = {
      sql: `${topLine}${finalSql}`
    };
    const diff = (JSON.stringify(cleanTree(tree1)) !== JSON.stringify(cleanTree(tree2)));
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

export const writePackage = async (version, extension=true, sqitchPath) => {
  if (!sqitchPath) {
    sqitchPath = await path();
  }
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);
  const extname = sluggify(pkg.name);
  const makePath = `${sqitchPath}/Makefile`;
  const controlPath = `${sqitchPath}/${extname}.control`;
  const sqlFileName = `${extname}--${version}.sql`;

  const Makefile = readFileSync(makePath).toString();
  const control = readFileSync(controlPath).toString();

  const { sql, diff, tree1, tree2 } = await packageModule(extension);

  const outPath = extension ? `${sqitchPath}/sql` : `${sqitchPath}/out`;

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
    writeFileSync(
      pkgPath,
      JSON.stringify(pkg, null, 2)
    );

    // makefile
    var regex = new RegExp(extname + '--[0-9.]+.sql');
    writeFileSync(makePath, Makefile.replace(regex, sqlFileName));
  }

  if (diff) {
    console.error(`DIFF exists! Careful. Check ${relative(sqitchPath, outPath)}/ folder...`);
    writeFileSync(`${outPath}/orig.${sqlFileName}.tree.json`, tree1);
    writeFileSync(`${outPath}/parsed.${sqlFileName}.tree.json`, tree2);
  }

  const writePath = `${outPath}/${sqlFileName}`;
  writeFileSync(writePath, sql);
  console.log(`${relative(sqitchPath, writePath)} written`);

};
