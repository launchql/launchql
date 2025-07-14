import { readFileSync } from 'fs';
import { basename, dirname, relative } from 'path';

export interface Module {
  path: string;
  requires: string[];
  version: string;
}

/**
 * Parse a .control file and extract its metadata.
 */
export function parseControlFile(filePath: string, basePath: string): Module {
  const contents = readFileSync(filePath, 'utf-8');
  const key = basename(filePath).split('.control')[0];
  const requires = contents
    .split('\n')
    .find((line) => /^requires/.test(line))
    ?.split('=')[1]
    .split(',')
    .map((req) => req.replace(/[\'\s]*/g, '').trim()) || [];

  const version = contents
    .split('\n')
    .find((line) => /^default_version/.test(line))
    ?.split('=')[1]
    .replace(/[\']*/g, '')
    .trim() || '';

  return {
    path: dirname(relative(basePath, filePath)),
    requires,
    version,
  };
}

/**
 * Generate content for a .control file
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
}): string {
  const {
    name,
    version,
    comment = `${name} extension`,
    requires = [],
    default_version = version,
    relocatable = false,
    superuser = false,
    schema
  } = options;

  let content = `# ${name} extension
comment = '${comment}'
default_version = '${default_version}'
relocatable = ${relocatable}
superuser = ${superuser}
`;

  if (schema) {
    content += `schema = ${schema}\n`;
  }

  if (requires.length > 0) {
    content += `requires = '${requires.join(',')}'`;
  }

  return content;
}