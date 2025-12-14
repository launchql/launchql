import { getEnvOptions } from '@launchql/env';
import { Logger } from '@pgpmjs/logger';
import { LaunchQLServer as server } from '@launchql/server';
import { PgpmOptions } from '@pgpmjs/types';
import { CLIOptions, Inquirerer, OptionValue,Question } from 'inquirerer';
import { getPgPool } from 'pg-cache';

const log = new Logger('server');

const serverUsageText = `
LaunchQL Server Command:

  lql server [OPTIONS]

  Start LaunchQL GraphQL development server.

Options:
  --help, -h              Show this help message
  --port <number>         Server port (default: 5555)
  --simpleInflection      Use simple inflection (default: true)
  --oppositeBaseNames     Use opposite base names (default: false)
  --postgis               Enable PostGIS extension (default: true)
  --metaApi               Enable Meta API (default: true)
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql server                    Start server with defaults
  lql server --port 8080        Start server on custom port
  lql server --no-postgis       Start server without PostGIS
`;

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
    name: 'origin',
    message: 'CORS origin (exact URL or *)',
    type: 'text',
    required: false,
    // no default to avoid accidentally opening up CORS; pass explicitly or via env
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
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(serverUsageText);
    process.exit(0);
  }

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
    metaApi,
    origin
  } = await prompter.prompt(argv, questions);

  // Warn when passing CORS override via CLI, especially in production
  if (origin && origin.trim().length) {
    const env = (process.env.NODE_ENV || 'development').toLowerCase();
    if (env === 'production') {
      if (origin.trim() === '*') {
        log.warn('CORS wildcard ("*") provided via --origin in production: this effectively disables CORS and is not recommended. Prefer per-API CORS via meta schema.');
      } else {
        log.warn(`CORS override (origin=${origin.trim()}) provided via --origin in production. Prefer per-API CORS via meta schema.`);
      }
    }
  }

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

  const options: PgpmOptions = getEnvOptions({
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
      port,
      ...(origin ? { origin } : {})
    }
  } as PgpmOptions);

  log.success('✅ Selected Configuration:');
  for (const [key, value] of Object.entries(options)) {
    log.debug(`${key}: ${JSON.stringify(value)}`);
  }

  log.success('🚀 Launching Server...\n');
  server(options);
};
