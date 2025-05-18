import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { readAndParsePackageJson } from './package';
import { extractFirst, usageText } from './utils';

// Commands
import deploy from './commands/deploy';
import server from './commands/server';
import explorer from './commands/explorer';
import verify from './commands/verify';
import revert from './commands/revert';
import init from './commands/init';
import extension from './commands/extension';
import plan from './commands/plan';
import _export from './commands/export';
import _package from './commands/package';
import kill from './commands/kill';
import { teardownPgPools } from '@launchql/server-utils';

// Command map
const commandMap: Record<string, Function> = {
  deploy,
  server,
  explorer,
  verify,
  revert,
  init,
  extension,
  plan,
  export: _export,
  package: _package,
  kill
};

export const commands = async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  if (argv.version || argv.v) {
    const pkg = readAndParsePackageJson();
    console.log(pkg.version);
    process.exit(0);
  }

  let { first: command, newArgv } = extractFirst(argv);

  // Show usage if explicitly requested
  if (argv.help || argv.h || command === 'help') {
    console.log(usageText);
    process.exit(0);
  }

  // Prompt if no command provided
  if (!command) {
    const answer = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'command',
        message: 'What do you want to do?',
        options: Object.keys(commandMap)
      }
    ]);
    command = answer.command;
  }

  // Prompt for working directory
  newArgv = await prompter.prompt(newArgv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);

  const commandFn = commandMap[command];

  if (!commandFn) {
    console.error(`Unknown command: ${command}`);
    console.log(usageText);
    process.exit(1);
  }

  await commandFn(newArgv, prompter, options);
  prompter.close();

  await teardownPgPools();
  return argv;
};
