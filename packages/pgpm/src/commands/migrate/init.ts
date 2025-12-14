import { PgpmMigrate } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../../utils/database';

const log = new Logger('migrate-init');

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const pgEnv = getPgEnvOptions();
  
  // Get target database
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database to initialize migration tracking'
  });
  
  const questions: Question[] = [
    {
      name: 'yes',
      type: 'confirm',
      message: `Initialize pgpm migration schema in database "${database}"?`,
      required: true
    }
  ];

  const { yes } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  log.info(`Initializing migration schema in database ${database}...`);
  
  const config = {
    host: pgEnv.host,
    port: pgEnv.port,
    user: pgEnv.user,
    password: pgEnv.password,
    database
  };
  
  const client = new PgpmMigrate(config);
  
  try {
    await client.initialize();
    log.success('Migration schema initialized successfully.');
    
    // Check if there's an existing Sqitch deployment to import
    const hasSquitch = await client.hasSqitchTables();
    if (hasSquitch) {
      const { importSquitch } = await prompter.prompt(argv, [
        {
          name: 'importSquitch',
          type: 'confirm',
          message: 'Existing Sqitch deployment detected. Import it?',
          required: true
        }
      ]);
      
      if (importSquitch) {
        log.info('Importing Sqitch deployment history...');
        await client.importFromSqitch();
        log.success('Sqitch deployment imported successfully.');
      }
    }
  } catch (error) {
    log.error(`Failed to initialize migration schema: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    await client.close();
  }

  return argv;
};
