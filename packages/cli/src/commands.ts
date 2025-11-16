import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { createPgpmCommandMap } from 'pgpm';

import explorer from './commands/explorer';
import server from './commands/server';
import upgrade from './commands/upgrade';
import { readAndParsePackageJson } from './package';
import { cliExitWithError,extractFirst, usageText } from './utils';
import { VersionTracker } from './utils/version-tracker';

const createCommandMap = (skipPgTeardown: boolean = false): Record<string, Function> => {
  const pgpmCommands = createPgpmCommandMap(skipPgTeardown);

  return {
    ...pgpmCommands,
    server,
    explorer,
    upgrade
  };
};

export const commands = async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions & { skipPgTeardown?: boolean }) => {
  if (argv.version || argv.v) {
    const pkg = readAndParsePackageJson();
    console.log(pkg.version);
    process.exit(0);
  }

  let { first: command, newArgv } = extractFirst(argv);

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

  const pkg = readAndParsePackageJson();
  const versionTracker = new VersionTracker(pkg.name, pkg.version);

  versionTracker.incrementCommandCount();

  if (versionTracker.shouldCheckForUpdates()) {
    const updateInfo = await versionTracker.checkForUpdates();
    if (updateInfo.hasUpdate) {
      console.log(`\n⚠️  A new version of ${pkg.name} is available: ${updateInfo.latestVersion} (current: ${pkg.version})`);
      console.log(`   Run 'lql upgrade' to update.\n`);
    }
  }

  await commandFn(newArgv, prompter, options);
  prompter.close();

  return argv;
};
