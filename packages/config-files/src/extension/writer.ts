import { writeFileSync } from 'fs';

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
 * Interface for extension information
 */
export interface ExtensionInfo {
  extname: string;
  packageDir: string;
  version: string;
  Makefile: string;
  controlFile: string;
  sqlFile: string;
}

/**
 * Write control and Makefile for the extension with given data.
 */
export const writeExtensions = (
  packageDir: string,
  extensions: string[],
  extInfo: ExtensionInfo
): void => {
  const { controlFile, Makefile, extname, version } = extInfo;
  writeExtensionControlFile(controlFile, extname, extensions, version);
  writeExtensionMakefile(Makefile, extname, version);
};