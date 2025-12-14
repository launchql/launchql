import { getEnvOptions } from '@launchql/env';
import { LaunchQLExplorer as explorer } from '@launchql/explorer';
import { Logger } from '@pgpmjs/logger';
import { PgpmOptions } from '@pgpmjs/types';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

const log = new Logger('explorer');

const explorerUsageText = `
LaunchQL Explorer Command:

  lql explorer [OPTIONS]

  Launch GraphiQL explorer interface.

Options:
  --help, -h              Show this help message
  --port <number>         Server port (default: 5555)
  --origin <url>          CORS origin URL (default: http://localhost:3000)
  --simpleInflection      Use simple inflection (default: true)
  --oppositeBaseNames     Use opposite base names (default: false)
  --postgis               Enable PostGIS extension (default: true)
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql explorer                        Launch explorer with defaults
  lql explorer --origin http://localhost:4000  Launch explorer with custom origin
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
    name: 'port',
    message: 'Development server port',
    type: 'number',
    required: false,
    default: 5555,
    useDefault: true
  },
  {
    name: 'origin',
    message: 'CORS origin URL',
    type: 'text',
    required: false,
    default: 'http://localhost:3000',
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
    console.log(explorerUsageText);
    process.exit(0);
  }

  log.info('🔧 LaunchQL Explorer Configuration:\n');

  const {
    oppositeBaseNames,
    origin,
    port,
    postgis,
    simpleInflection
  } = await prompter.prompt(argv, questions);

  const options: PgpmOptions = getEnvOptions({
    features: {
      oppositeBaseNames,
      simpleInflection,
      postgis
    },
    server: {
      origin,
      port
    }
  });

  log.success('✅ Selected Configuration:');
  for (const [key, value] of Object.entries(options)) {
    log.debug(`${key}: ${JSON.stringify(value)}`);
  }

  log.success('🚀 Launching Explorer...\n');
  explorer(options);
};
