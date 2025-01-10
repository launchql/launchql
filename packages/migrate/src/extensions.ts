import { readFileSync, writeFileSync } from 'fs';

interface ExtensionInfo {
  extname: string;
  packageDir: string;
  version: string;
  Makefile: string;
  controlFile: string;
  sqlFile: string;
}

/**
 * Get the list of available extensions, including predefined core extensions.
 */
export const getAvailableExtensions = (
  modules: Record<string, unknown>
): string[] => {
  const coreExtensions = [
    'address_standardizer',
    'address_standardizer_data_us',
    'bloom',
    'btree_gin',
    'btree_gist',
    'citext',
    'hstore',
    'intarray',
    'pg_trgm',
    'pgcrypto',
    'plpgsql',
    'plperl',
    'plv8',
    'postgis_tiger_geocoder',
    'postgis_topology',
    'postgis',
    'postgres_fdw',
    'unaccent',
    'uuid-ossp',
  ];

  return Object.keys(modules).reduce<string[]>((acc, module) => {
    if (!acc.includes(module)) acc.push(module);
    return acc;
  }, [...coreExtensions]);
};

/**
 * Parse the sqitch.plan file to get the extension name.
 */
export const getExtensionName = (packageDir: string): string => {
  const plan = readFileSync(`${packageDir}/sqitch.plan`, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^%project=/.test(line));

  if (!plan.length) {
    throw new Error('No project name found in sqitch.plan!');
  }

  return plan[0].split('=')[1].trim();
};

/**
 * Get detailed information about an extension in the specified directory.
 */
export const getExtensionInfo = (packageDir: string): ExtensionInfo => {
  const pkgPath = `${packageDir}/package.json`;
  const pkg = require(pkgPath);
  const extname = getExtensionName(packageDir);
  const version = pkg.version;
  const Makefile = `${packageDir}/Makefile`;
  const controlFile = `${packageDir}/${extname}.control`;
  const sqlFile = `sql/${extname}--${version}.sql`;

  return { extname, packageDir, version, Makefile, controlFile, sqlFile };
};

/**
 * Get a list of extensions required by an extension from its control file.
 */
export const getInstalledExtensions = (controlFilePath: string): string[] => {
  try {
    const requiresLine = readFileSync(controlFilePath, 'utf-8')
      .split('\n')
      .find((line) => /^requires/.test(line));

    if (!requiresLine) {
      throw new Error('No "requires" line found in the control file.');
    }

    return requiresLine
      .split('=')[1]
      .split("'")[1]
      .split(',')
      .map((ext) => ext.trim());
  } catch (e) {
    throw new Error('Error parsing "requires" from control file.');
  }
};

/**
 * Write the Makefile for the extension.
 */
export const writeExtensionMakefile = (
  outputPath: string,
  extname: string,
  version: string
): void => {
  const content = `EXTENSION = ${extname}
DATA = sql/${extname}--${version}.sql

PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
  `;
  writeFileSync(outputPath, content);
};

/**
 * Write the control file for the extension.
 */
export const writeExtensionControlFile = (
  outputPath: string,
  extname: string,
  extensions: string[],
  version: string
): void => {
  const content = `# ${extname} extension
comment = '${extname} extension'
default_version = '${version}'
module_pathname = '$libdir/${extname}'
requires = '${extensions.join(',')}'
relocatable = false
superuser = false
  `;
  writeFileSync(outputPath, content);
};

/**
 * Write control and Makefile for the extension with given data.
 */
export const writeExtensions = async (
  packageDir: string,
  extensions: string[]
): Promise<void> => {
  const { controlFile, Makefile, extname, version } = getExtensionInfo(packageDir);
  writeExtensionControlFile(controlFile, extname, extensions, version);
  writeExtensionMakefile(Makefile, extname, version);
};
