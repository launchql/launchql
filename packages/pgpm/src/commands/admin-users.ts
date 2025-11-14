import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { extractFirst } from '../utils';
import add from './admin-users/add';
import bootstrap from './admin-users/bootstrap';
import remove from './admin-users/remove';

const subcommandMap: Record<string, Function> = {
  add,
  bootstrap,
  remove
};

const adminUsersUsageText = `
Admin Users Commands:

  pgpm admin-users bootstrap    Initialize postgres roles and permissions (must be run first)
  pgpm admin-users add          Add database users with roles
  pgpm admin-users remove       Remove database users and revoke roles

Options:
  --help, -h     Show this help message
  --cwd          Working directory (default: current directory)
`;

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  let { first: subcommand, newArgv } = extractFirst(argv);

  // Prompt if no subcommand provided
  if (!subcommand) {
    // Show usage if explicitly requested and no subcommand provided
    if (argv.help || argv.h) {
      console.log(adminUsersUsageText);
      process.exit(0);
    }

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

  if (subcommand === 'help') {
    console.log(adminUsersUsageText);
    process.exit(0);
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
    bootstrap: 'Initialize postgres roles and permissions (must be run first)',
    add: 'Add database users with roles',
    remove: 'Remove database users and revoke roles'
  };
  return descriptions[cmd] || '';
}
