import { findAndRequirePackageJson } from 'find-and-require-package-json';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { checkForUpdates, createInitUsageText, createPgpmCommandMap } from 'pgpm';

import codegen from './commands/codegen';
import explorer from './commands/explorer';
import getGraphqlSchema from './commands/get-graphql-schema';
import server from './commands/server';
import { cliExitWithError, extractFirst, usageText } from './utils';

const createCommandMap = (skipPgTeardown: boolean = false): Record<string, Function> => {
  const pgpmCommands = createPgpmCommandMap(skipPgTeardown);

  return {
    ...pgpmCommands,
    server,
    explorer,
    'get-graphql-schema': getGraphqlSchema,
    codegen
  };
};

export const commands = async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions & { skipPgTeardown?: boolean }) => {
  let { first: command, newArgv } = extractFirst(argv);

  // Run update check early so it shows on help/version paths too
  try {
    const pkg = findAndRequirePackageJson(__dirname);
    await checkForUpdates({
      command: command || 'help',
      pkgName: pkg.name,
      pkgVersion: pkg.version,
      toolName: 'lql',
      key: pkg.name,
      updateCommand: `Run npm i -g ${pkg.name}@latest to upgrade.`
    });
  } catch {
    // ignore update check failures
  }

  if (argv.version || argv.v) {
    const pkg = findAndRequirePackageJson(__dirname);
    console.log(pkg.version);
    process.exit(0);
  }

  // Show usage if explicitly requested but no command specified
  if ((argv.help || argv.h || command === 'help') && !command) {
    console.log(usageText);
    process.exit(0);
  }
  
  // Show usage for help command specifically
  if (command === 'help') {
    console.log(usageText);
    process.exit(0);
  }

  // Command-specific help for init
  if (command === 'init' && (argv.help || argv.h)) {
    console.log(createInitUsageText('lql', 'LaunchQL'));
    process.exit(0);
  }

  const commandMap = createCommandMap(options?.skipPgTeardown);

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
    console.log(usageText);
    await cliExitWithError(`Unknown command: ${command}`);
  }

  await commandFn(newArgv, prompter, options);
  prompter.close();

  return argv;
};
