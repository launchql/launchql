import { LaunchQLServer as server } from '@launchql/server';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { getRootPgPool, Logger } from '@launchql/server-utils';

const log = new Logger('server');

const questions: Question[] = [
  {
    name: 'simpleInflection',
    message: 'Use simple inflection?',
    type: 'confirm',
    required: false,
    default: true,
    useDefault: true
  },
  {
    name: 'oppositeBaseNames',
    message: 'Use opposite base names?',
    type: 'confirm',
    required: false,
    default: false,
    useDefault: true
  },
  {
    name: 'postgis',
    message: 'Enable PostGIS extension?',
    type: 'confirm',
    required: false,
    default: true,
    useDefault: true
  },
  {
    name: 'port',
    message: 'Development server port',
    type: 'number',
    required: false,
    default: 5555,
    useDefault: true
  }
];

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  log.info('🔧 LaunchQL Server Configuration:\n');

  let selectedDb: string | undefined = process.env.PGDATABASE;

  if (!selectedDb) {
    const db = await getRootPgPool({ database: 'postgres' });
    const result = await db.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false AND datname NOT IN ('postgres')
        AND datname !~ '^pg_'
      ORDER BY datname;
    `);

    const dbChoices = result.rows.map(row => row.datname);
    const { database } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'database',
        message: 'Select the database to use',
        options: dbChoices,
        required: true
      }
    ]);

    selectedDb = database;
    log.info(`📌 Using database: "${selectedDb}"`);
  }

  const {
    oppositeBaseNames,
    port,
    postgis,
    simpleInflection
  } = await prompter.prompt(argv, questions);

  const options: LaunchQLOptions = getEnvOptions({
    pg: { database: selectedDb },
    features: {
      oppositeBaseNames,
      simpleInflection,
      postgis
    },
    server: {
      port
    }
  });

  log.success('✅ Selected Configuration:');
  for (const [key, value] of Object.entries(options)) {
    log.debug(`${key}: ${JSON.stringify(value)}`);
  }

  log.success('🚀 Launching Server...\n');
  server(options);
};
