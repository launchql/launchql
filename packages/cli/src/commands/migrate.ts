import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { extractFirst } from '../utils';

// Migrate subcommands
import init from './migrate/init';
import status from './migrate/status';
import list from './migrate/list';
import deps from './migrate/deps';

const subcommandMap: Record<string, Function> = {
  init,
  status,
  list,
  deps
};

const migrateUsageText = `
LaunchQL Migrate Commands:

  launchql migrate init      Initialize migration tracking in database
  launchql migrate status    Show current migration status
  launchql migrate list      List all changes (deployed and pending)
  launchql migrate deps      Show change dependencies

Options:
  --help, -h     Show this help message
  --cwd          Working directory (default: current directory)
`;

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  let { first: subcommand, newArgv } = extractFirst(argv);

  // Show usage if explicitly requested
  if (argv.help || argv.h || subcommand === 'help') {
    console.log(migrateUsageText);
    process.exit(0);
  }

  // Prompt if no subcommand provided
  if (!subcommand) {
    const answer = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'subcommand',
        message: 'What migrate operation do you want to perform?',
        options: Object.keys(subcommandMap).map(cmd => ({
          name: cmd,
          value: cmd,
          description: getSubcommandDescription(cmd)
        }))
      }
    ]);
    subcommand = answer.subcommand;
  }

  const subcommandFn = subcommandMap[subcommand];

  if (!subcommandFn) {
    console.error(`Unknown migrate subcommand: ${subcommand}`);
    console.log(migrateUsageText);
    process.exit(1);
  }

  await subcommandFn(newArgv, prompter, options);
};

function getSubcommandDescription(cmd: string): string {
  const descriptions: Record<string, string> = {
    init: 'Initialize migration tracking in database',
    status: 'Show current migration status',
    list: 'List all changes (deployed and pending)',
    deps: 'Show change dependencies'
  };
  return descriptions[cmd] || '';
}