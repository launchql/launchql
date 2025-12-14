import { Logger } from '@pgpmjs/logger';
import { RawStmt } from '@pgsql/types';
import { mkdirSync, readFileSync, rmSync,writeFileSync } from 'fs';
import { relative } from 'path';
import { deparse } from 'pgsql-deparser';
import { parse } from 'pgsql-parser';

import { getExtensionName } from '../files';
import { resolve, resolveWithPlan } from '../resolution/resolve';
import { transformProps } from './transform';

const log = new Logger('package');

const noop = (): any => undefined;

export const cleanTree = (tree: any): any => {
  return transformProps(tree, {
    stmt_len: noop,
    stmt_location: noop,
    location: noop,
  });
};

interface PackageModuleOptions {
  usePlan?: boolean;
  extension?: boolean;
  pretty?: boolean;
  functionDelimiter?: string;
}

interface WritePackageOptions extends PackageModuleOptions {
  version: string;
  packageDir: string;
}

const filterStatements = (stmts: RawStmt[], extension: boolean): RawStmt[] => {
  if (!extension) return stmts;
  return stmts.filter(node => {
    const stmt = node.stmt;
    return !stmt.hasOwnProperty('TransactionStmt') && 
           !stmt.hasOwnProperty('CreateExtensionStmt');
  });
};

export const packageModule = async (
  packageDir: string,
  { usePlan = true, extension = true, pretty = true, functionDelimiter = '$EOFCODE$' }: PackageModuleOptions = {}
): Promise<{ sql: string; diff?: boolean; tree1?: string; tree2?: string }> => {
  const resolveFn = usePlan ? resolveWithPlan : resolve;
  const sql = resolveFn(packageDir);

  if (!sql?.trim()) {
    log.warn(`⚠️ No SQL generated for module at ${packageDir}. Skipping.`);
    return { sql: '' };
  }

  const extname = getExtensionName(packageDir);

  try {
    const parsed = await parse(sql);
    parsed.stmts = filterStatements(parsed.stmts as any, extension);

    const topLine = extension
      ? `\\echo Use "CREATE EXTENSION ${extname}" to load this file. \\quit\n`
      : '';

    const finalSql = await deparse(parsed, {
      pretty,
      functionDelimiter
    });

    const tree1 = parsed.stmts;
    const tree2 = await parse(finalSql);

    const results: {
      sql: string;
      diff?: boolean;
      tree1?: string;
      tree2?: string;
    } = {
      sql: `${topLine}${finalSql}`,
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
    log.error(`❌ Failed to parse SQL for ${packageDir}`);
    console.error(e);
    throw e;
  }
};

export const writePackage = async ({
  version,
  extension = true,
  usePlan = true,
  packageDir,
}: WritePackageOptions): Promise<void> => {
  const pkgPath = `${packageDir}/package.json`;
  const pkg = require(pkgPath);
  const extname = await getExtensionName(packageDir);
  const makePath = `${packageDir}/Makefile`;
  const controlPath = `${packageDir}/${extname}.control`;
  const sqlFileName = `${extname}--${version}.sql`;

  const Makefile = readFileSync(makePath, 'utf-8');
  const control = readFileSync(controlPath, 'utf-8');

  const { sql, diff, tree1, tree2 } = await packageModule(packageDir, {
    extension,
    usePlan,
  });

  const outPath = extension ? `${packageDir}/sql` : `${packageDir}/out`;

  rmSync(outPath, { recursive: true, force: true });
  mkdirSync(outPath, { recursive: true });

  if (extension) {
    writeFileSync(
      controlPath,
      control.replace(
        /default_version = '[0-9\.]+'/,
        `default_version = '${version}'`
      )
    );

    pkg.version = version;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    const regex = new RegExp(`${extname}--[0-9.]+.sql`);
    writeFileSync(makePath, Makefile.replace(regex, sqlFileName));
  }

  if (diff) {
    log.warn(`⚠️ SQL diff exists! Review the ${relative(packageDir, outPath)}/ folder.`);
    // Uncomment if needed:
    // writeFileSync(`${outPath}/orig.${sqlFileName}.tree.json`, tree1);
    // writeFileSync(`${outPath}/parsed.${sqlFileName}.tree.json`, tree2);
  }

  const writePath = `${outPath}/${sqlFileName}`;
  writeFileSync(writePath, sql);
  log.success(`${relative(packageDir, writePath)} written`);
};
