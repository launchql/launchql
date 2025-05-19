import { CLIOptions, Inquirerer, OptionValue } from 'inquirerer';
import { getRootPgPool, Logger } from '@launchql/server-utils';

const log = new Logger('db-kill');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const db = await getRootPgPool({
    database: 'postgres'
  });

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

  const selectedDbNames = databases.filter(d => d.selected).map(d => d.value);

  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: `Are you sure you want to kill connections${argv.drop === false ? '' : ' and DROP'}: ${selectedDbNames.join(', ')}?`,
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
