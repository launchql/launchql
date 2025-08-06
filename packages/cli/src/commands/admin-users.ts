import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { extractFirst } from '../utils';
import add from './admin-users/add';
import remove from './admin-users/remove';

const subcommandMap: Record<string, Function> = {
  add,
  remove
};

const adminUsersUsageText = `
LaunchQL Admin Users Commands:

  lql admin-users add       Add database users with roles
  lql admin-users remove    Remove database users and revoke roles

Options:
  --help, -h     Show this help message
  --cwd          Working directory (default: current directory)
`;

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  let { first: subcommand, newArgv } = extractFirst(argv);

  // Show usage if explicitly requested
  if (argv.help || argv.h || subcommand === 'help') {
    console.log(adminUsersUsageText);
    process.exit(0);
  }

  // Prompt if no subcommand provided
  if (!subcommand) {
    const answer = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'subcommand',
        message: 'What admin users operation do you want to perform?',
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
    console.error(`Unknown admin-users subcommand: ${subcommand}`);
    console.log(adminUsersUsageText);
    process.exit(1);
  }

  await subcommandFn(newArgv, prompter, options);
};

function getSubcommandDescription(cmd: string): string {
  const descriptions: Record<string, string> = {
    add: 'Add database users with roles',
    remove: 'Remove database users and revoke roles'
  };
  return descriptions[cmd] || '';
}
