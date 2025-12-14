import { Logger } from '@pgpmjs/logger';
import { promises as fs } from 'fs';
import path from 'path';
import { Client } from 'pg';
import { getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

import { generateCodeTree } from './codegen/codegen';
import getIntrospectionRows, { GetIntrospectionRowsOptions } from './introspect';
import { DatabaseObject } from './types';

const log = new Logger('pg-codegen');

/**
 * Writes the generated code files to the specified directory.
 *
 * @param outputDir The base directory to write the files.
 * @param fileTree The file tree containing file paths and content.
 */
const writeGeneratedFiles = async (
  outputDir: string,
  fileTree: Record<string, string>
): Promise<void> => {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write each file to its corresponding path
    for (const [filePath, content] of Object.entries(fileTree)) {
      const fullPath = path.join(outputDir, filePath);

      // Ensure the directory for the file exists
      const dirName = path.dirname(fullPath);
      await fs.mkdir(dirName, { recursive: true });

      // Write the file content
      await fs.writeFile(fullPath, content, 'utf8');
    }
  } catch (error) {
    log.error(`Failed to write files to ${outputDir}:`, error);
    throw error;
  }
};

(async () => {
  const env = getPgEnvOptions();
  const pool = getPgPool(env);
  const options: GetIntrospectionRowsOptions = {
    // @ts-ignore
    client: pool as Client, // hope this is ok?
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true,
    },
    namespacesToIntrospect: ['collections_public'],
    includeExtensions: false,
  };

  const outputDirectory = path.join(__dirname, '../../../__fixtures__/output');

  try {
    // Clean the output directory
    await fs.rm(outputDirectory, { recursive: true, force: true });
    log.info(`Cleaned output directory: ${outputDirectory}`);

    // Fetch introspection rows
    const rows: DatabaseObject[] = await getIntrospectionRows(options);
    log.info('Introspection Rows Fetched:', rows);

    // Generate TypeScript code
    const codegenOptions = {
      includeTimestamps: true,
      includeUUID: true,
    };
    const generatedCode = generateCodeTree(rows, codegenOptions);

    log.info('Generated TypeScript Code Tree:', generatedCode);

    // Write the generated code to files
    await writeGeneratedFiles(outputDirectory, generatedCode);

    log.info(`Generated files written to ${outputDirectory}`);
  } catch (error) {
    log.error('Failed to fetch introspection rows or generate code:', error);
  }
})();