import { LaunchQLExplorer as explorer } from '@launchql/explorer';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import chalk from 'chalk';
import { getEnvOptions, LaunchQLOptions } from '@launchql/types';

const questions: Question[] = [
  {
    name: 'simpleInflection',
    message: chalk.cyan('Use simple inflection?'),
    type: 'confirm',
    // alias: 's',
    required: false,
    default: true,
    useDefault: true
  },
  {
    name: 'oppositeBaseNames',
    message: chalk.cyan('Use opposite base names?'),
    type: 'confirm',
    // alias: 'b', 
    required: false,
    default: false,
    useDefault: true
  },
  {
    name: 'postgis',
    message: chalk.cyan('Enable PostGIS extension?'),
    type: 'confirm',
    // alias: 'g',
    required: false,
    default: true,
    useDefault: true
  },
  {
    name: 'port',
    message: chalk.cyan('Development server port'),
    type: 'number',
    // alias: 'p',
    required: false,
    default: 5555,
    useDefault: true
  },
  {
    name: 'origin',
    message: chalk.cyan('CORS origin URL'),
    type: 'text',
    // alias: 'o',
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
  console.log(chalk.gray('\n🔧 LaunchQL Explorer Configuration:\n'));

  const {
    oppositeBaseNames,
    origin,
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
      origin,
      port
    }
  });

  console.log(chalk.green('\n✅ Selected Configuration:'));
  for (const [key, value] of Object.entries(options)) {
    console.log(`${chalk.yellow(`  ${key}`)}: ${chalk.white(String(value))}`);
  }

  console.log(chalk.gray('\n🚀 Launching Explorer...\n'));
  explorer(options);
};
