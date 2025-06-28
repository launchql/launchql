import { LaunchQLServer as server } from '@launchql/server';
import { CLIOptions, Inquirerer, Question, OptionValue } from 'inquirerer';
import { getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';

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
    name: 'metaApi',
    message: 'Enable Meta API?',
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
    const db = await getPgPool({ database: 'postgres' });
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
    simpleInflection,
    metaApi
  } = await prompter.prompt(argv, questions);

  let selectedSchemas: string[] = [];
  let authRole: string | undefined;
  let roleName: string | undefined;
  if (!metaApi) {
    const db = await getPgPool({ database: selectedDb });
    const result = await db.query(`
      SELECT nspname 
      FROM pg_namespace 
      WHERE nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY nspname;
    `);
    
    const schemaChoices = result.rows.map(row => ({
      name: row.nspname,
      value: row.nspname,
      selected: true
    }));
    const { schemas } = await prompter.prompt(argv, [
      {
        type: 'checkbox',
        name: 'schemas',
        message: 'Select schemas to expose',
        options: schemaChoices,
        required: true
      }
    ]);
    
    selectedSchemas = (schemas as OptionValue[]).filter(s => s.selected).map(s => s.value);
    const { authRole: selectedAuthRole, roleName: selectedRoleName } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'authRole',
        message: 'Select the authentication role',
        options: ['postgres', 'authenticated', 'anonymous'],
        required: true
      },
      {
        type: 'autocomplete',
        name: 'roleName',
        message: 'Enter the default role name:',
        options: ['postgres', 'authenticated', 'anonymous'],
        required: true
      }
    ]);
    authRole = selectedAuthRole;
    roleName = selectedRoleName;
  }

  const options: LaunchQLOptions = getEnvOptions({
    pg: { database: selectedDb },
    features: {
      oppositeBaseNames,
      simpleInflection,
      postgis
    },
    api: {
      enableMetaApi: metaApi,
      ...(metaApi === false && { exposedSchemas: selectedSchemas, authRole, roleName })
    },
    server: {
      port
    }
  } as LaunchQLOptions);

  log.success('✅ Selected Configuration:');
  for (const [key, value] of Object.entries(options)) {
    log.debug(`${key}: ${JSON.stringify(value)}`);
  }

  log.success('🚀 Launching Server...\n');
  server(options);
};
