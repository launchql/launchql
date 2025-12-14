import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer, OptionValue } from 'inquirerer';
import { getPgPool } from 'pg-cache';

const log = new Logger('db-kill');

const killUsageText = `
Kill Command:

  pgpm kill [OPTIONS]

  Terminate database connections and optionally drop databases.

Options:
  --help, -h              Show this help message
  --drop                  Drop databases after killing connections (default: true)
  --no-drop               Only kill connections, don't drop databases
  --pattern <pattern>     Pattern to match database names (supports SQL LIKE syntax)
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm kill                Kill connections and drop selected databases (interactive)
  pgpm kill --no-drop      Only kill connections, preserve databases (interactive)
  pgpm kill --pattern test_%   Kill connections to databases matching 'test_%' pattern
  pgpm kill --pattern %dev --no-drop  Kill connections to databases ending with 'dev' but don't drop
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(killUsageText);
    process.exit(0);
  }
  const db = await getPgPool({
    database: 'postgres'
  });

  let selectedDbNames: string[];

  if (argv.pattern) {
    // Pattern mode: automatically find databases matching the pattern
    const databasesResult = await db.query(`
      SELECT datname FROM pg_catalog.pg_database
      WHERE datistemplate = FALSE AND datname NOT IN ('postgres')
        AND datname !~ '^pg_' AND datname LIKE $1;
    `, [argv.pattern]);

    if (!databasesResult.rows.length) {
      log.info(`ℹ️  No databases found matching pattern "${argv.pattern}". Exiting.`);
      return;
    }

    selectedDbNames = databasesResult.rows.map(row => row.datname);
    log.info(`🎯 Found ${selectedDbNames.length} database(s) matching pattern "${argv.pattern}": ${selectedDbNames.join(', ')}`);
  } else {
    // Interactive mode: prompt user to select databases
    const databasesResult = await db.query(`
      SELECT datname FROM pg_catalog.pg_database
      WHERE datistemplate = FALSE AND datname NOT IN ('postgres')
        AND datname !~ '^pg_';
    `);

    if (!databasesResult.rows.length) {
      log.info('ℹ️  No databases found to process. Exiting.');
      return;
    }

    let databases: OptionValue[];
    ({ databases } = await prompter.prompt(argv, [
      {
        type: 'checkbox',
        name: 'databases',
        message: 'Select database(s) to terminate connections and optionally drop',
        options: databasesResult.rows.map(row => row.datname),
        required: true
      }
    ]));

    selectedDbNames = databases.filter(d => d.selected).map(d => d.value);
  }

  const actionText = argv.drop === false ? 'kill connections to' : 'kill connections and DROP';
  const patternText = argv.pattern ? ` (matched by pattern "${argv.pattern}")` : '';
  
  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: `Are you sure you want to ${actionText}: ${selectedDbNames.join(', ')}${patternText}?`,
      default: false
    }
  ]);

  if (!yes) {
    log.info('❌ Aborted. No actions were taken.');
    return;
  }

  for (const dbname of selectedDbNames) {
    const killResult = await db.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid();
      `,
      [dbname]
    );

    log.warn(`💀 Terminated ${killResult.rowCount} connection(s) to "${dbname}".`);

    if (argv.drop === false) {
      log.info(`⚠️  Skipping DROP for "${dbname}" due to --no-drop flag.`);
      continue;
    }

    try {
      await db.query(`DROP DATABASE "${dbname}";`);
      log.success(`🗑️  Dropped database "${dbname}" successfully.`);
    } catch (err: any) {
      log.error(`❌ Failed to drop "${dbname}": ${err.message}`);
    }
  }

  log.success('✅ Done processing databases.');
};
