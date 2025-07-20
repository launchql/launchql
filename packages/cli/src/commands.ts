import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { teardownPgPools } from 'pg-cache';

// Commands
import deploy from './commands/deploy';
import explorer from './commands/explorer';
import _export from './commands/export';
import extension from './commands/extension';
import init from './commands/init';
import install from './commands/install';
import kill from './commands/kill';
import migrate from './commands/migrate';
import _package from './commands/package';
import plan from './commands/plan';
import revert from './commands/revert';
import server from './commands/server';
import verify from './commands/verify';
import { readAndParsePackageJson } from './package';
import { extractFirst, usageText } from './utils';

const withPgTeardown = (fn: Function) => async (...args: any[]) => {
  try {
    await fn(...args);
  } finally {
    await teardownPgPools();
  }
};

const pgt = withPgTeardown;
const commandMap: Record<string, Function> = {
  deploy: pgt(deploy),
  verify: pgt(verify),
  revert: pgt(revert),
  init: pgt(init),
  extension: pgt(extension),
  plan: pgt(plan),
  export: pgt(_export),
  package: pgt(_package),
  kill: pgt(kill),
  install: pgt(install),
  migrate: pgt(migrate),

  // These manage their own connection lifecycles
  server,
  explorer
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

  return argv;
};
