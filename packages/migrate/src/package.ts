import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { relative } from 'path';
import { deparse, parse } from 'pgsql-parser';

import { getExtensionName } from './extensions';
import { resolve, resolveWithPlan } from './resolve';
import { transformProps } from './transform';

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
}

interface WritePackageOptions extends PackageModuleOptions {
  version: string;
  packageDir: string;
}

/**
 * Packages a module into a single SQL script.
 * 
 * @param options - Options for packaging the module.
 * @param packageDir - The base directory of the package.
 * @returns An object containing the SQL script and optional diff information.
 */
export const packageModule = async (
  packageDir: string,
  { usePlan = true, extension = true }: PackageModuleOptions = {}
): Promise<{ sql: string; diff?: boolean; tree1?: string; tree2?: string }> => {
  const resolveFn = usePlan ? resolveWithPlan : resolve;
  const sql = await resolveFn(packageDir);
  const extname = await getExtensionName(packageDir);
  
  try {
    const parsed = parse(sql);
    const stmts = parsed.reduce((m: any[], node: any) => {
      if (extension) {
        if (node.RawStmt.stmt.hasOwnProperty('TransactionStmt')) return m;
        if (node.RawStmt.stmt.hasOwnProperty('CreateExtensionStmt')) return m;
      }
      return [...m, node];
    }, []);
  
    const topLine = extension
      ? `\\echo Use "CREATE EXTENSION ${extname}" to load this file. \\quit\n`
      : '';
    const finalSql = deparse(stmts, {});
    const tree1 = stmts;
    const tree2 = parse(finalSql);
  
    // Explicitly define the results object
    const results: {
        sql: string;
        diff?: boolean;
        tree1?: string;
        tree2?: string;
      } = {
        sql: `${topLine}${finalSql}`,
      };
  
    // Check for differences and add properties if they exist
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
    throw e;
  }
};
  

/**
 * Writes a packaged module to disk.
 * 
 * @param options - Options for writing the package.
 */
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
    // Update control file
    writeFileSync(
      controlPath,
      control.replace(
        /default_version = '[0-9\.]+'/,
        `default_version = '${version}'`
      )
    );

    // Update package.json
    pkg.version = version;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Update Makefile
    const regex = new RegExp(`${extname}--[0-9.]+.sql`);
    writeFileSync(makePath, Makefile.replace(regex, sqlFileName));
  }

  if (diff) {
    console.error(
      `DIFF exists! Careful. Check ${relative(packageDir, outPath)}/ folder...`
    );
    // Uncomment below if you need to save tree differences
    // writeFileSync(`${outPath}/orig.${sqlFileName}.tree.json`, tree1);
    // writeFileSync(`${outPath}/parsed.${sqlFileName}.tree.json`, tree2);
  }

  const writePath = `${outPath}/${sqlFileName}`;
  writeFileSync(writePath, sql);
  console.log(`${relative(packageDir, writePath)} written`);
};