import { writeFileSync } from 'fs';

import { getExtensionInfo } from './reader';

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
 * Generate content for a .control file
 * https://www.postgresql.org/docs/current/extend-extensions.html
 */
export function generateControlFileContent(options: {
  name: string;
  version: string;
  comment?: string;
  requires?: string[];
  default_version?: string;
  relocatable?: boolean;
  superuser?: boolean;
  schema?: string;
  module_pathname?: string;
}): string {
  const {
    name,
    version,
    comment = `${name} extension`,
    requires = [],
    default_version = version,
    relocatable = false,
    superuser = false,
    schema,
    module_pathname
  } = options;

  let content = `# ${name} extension
comment = '${comment}'
default_version = '${default_version}'
`;

  if (module_pathname) {
    content += `module_pathname = '${module_pathname}'\n`;
  } else {
    content += `module_pathname = '$libdir/${name}'\n`;
  }

  if (requires.length > 0) {
    content += `requires = '${requires.join(',')}'\n`;
  }

  content += `relocatable = ${relocatable}
superuser = ${superuser}\n`;

  if (schema) {
    content += `schema = ${schema}\n`;
  }

  return content;
}

/**
 * Write the control file for the extension.
 */
export const writeExtensionControlFile = (
  outputPath: string,
  extname: string,
  extensions: string[],
  version: string
): void => {
  const content = generateControlFileContent({
    name: extname,
    version,
    requires: extensions
  });
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
 * If extInfo is not provided, it will be generated from packageDir.
 */
export const writeExtensions = (
  packageDir: string,
  extensions: string[],
  extInfo?: ExtensionInfo
): void => {
  // If extInfo is not provided, get it from packageDir
  const info = extInfo || getExtensionInfo(packageDir);
  const { controlFile, Makefile, extname, version } = info;
  writeExtensionControlFile(controlFile, extname, extensions, version);
  writeExtensionMakefile(Makefile, extname, version);
};