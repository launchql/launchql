import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

export interface DatabaseSelectionOptions {
  message?: string;
  excludeTemplates?: boolean;
  excludePostgres?: boolean;
  excludeSystemDbs?: boolean;
  multiple?: boolean;
}

/**
 * Get list of available databases from PostgreSQL
 */
export async function getAvailableDatabases(options: DatabaseSelectionOptions = {}): Promise<string[]> {
  const {
    excludeTemplates = true,
    excludePostgres = true,
    excludeSystemDbs = true
  } = options;

  const db = await getPgPool({
    database: 'postgres'
  });

  let query = `
    SELECT datname FROM pg_catalog.pg_database
    WHERE 1=1
  `;

  if (excludeTemplates) {
    query += ` AND datistemplate = FALSE`;
  }

  if (excludePostgres) {
    query += ` AND datname NOT IN ('postgres')`;
  }

  if (excludeSystemDbs) {
    query += ` AND datname !~ '^pg_'`;
  }

  query += ` ORDER BY datname`;

  const result = await db.query(query);
  return result.rows.map((row: any) => row.datname);
}

/**
 * Prompt user to select a database
 */
export async function selectDatabase(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  options: DatabaseSelectionOptions = {}
): Promise<string> {
  const {
    message = 'Select target database',
    multiple = false
  } = options;

  // Check if database is already specified
  if (!multiple && (argv.db || argv.database)) {
    return argv.db || argv.database;
  }

  // Get available databases
  const databases = await getAvailableDatabases(options);

  if (databases.length === 0) {
    throw new Error('No databases found');
  }

  // If only one database and not forcing selection, use it
  if (!multiple && databases.length === 1 && !argv.interactive) {
    return databases[0];
  }

  // Prompt for selection
  const answer = await prompter.prompt(argv, [
    {
      type: multiple ? 'checkbox' : 'autocomplete',
      name: 'database',
      message,
      options: databases,
      required: true
    }
  ]);

  return answer.database;
}

/**
 * Get target database with fallback to environment
 */
export async function getTargetDatabase(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  options: DatabaseSelectionOptions = {}
): Promise<string> {
  // If database is specified in args, use it
  if (argv.db || argv.database) {
    return argv.db || argv.database;
  }

  // Try to select from available databases
  try {
    return await selectDatabase(argv, prompter, options);
  } catch (error) {
    // Fall back to environment database
    const pgEnv = getPgEnvOptions();
    if (pgEnv.database) {
      return pgEnv.database;
    }
    throw new Error('No database specified and no default database found');
  }
}