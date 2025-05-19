import { LaunchQLServer as server } from '@launchql/server';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';

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
  },
//   {
//     name: 'origin',
//     message: chalk.cyan('CORS origin URL'),
//     type: 'text',
//     // alias: 'o',
//     required: false,
//     default: 'http://localhost:3000',
//     useDefault: true
//   }
];

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  log.info('🔧 LaunchQL Server Configuration:\n');

  const {
    oppositeBaseNames,
    port,
    postgis,
    simpleInflection
  } = await prompter.prompt(argv, questions);

  const options: LaunchQLOptions = getEnvOptions({
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
