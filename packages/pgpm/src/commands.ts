import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { teardownPgPools } from 'pg-cache';

import add from './commands/add';
import adminUsers from './commands/admin-users';
import analyze from './commands/analyze';
import clear from './commands/clear';
import cache from './commands/cache';
import deploy from './commands/deploy';
import docker from './commands/docker';
import env from './commands/env';
import _export from './commands/export';
import extension from './commands/extension';
import update from './commands/update';
import init from './commands/init';
import install from './commands/install';
import kill from './commands/kill';
import migrate from './commands/migrate';
import _package from './commands/package';
import plan from './commands/plan';
import remove from './commands/remove';
import renameCmd from './commands/rename';
import revert from './commands/revert';
import tag from './commands/tag';
import verify from './commands/verify';
import { readAndParsePackageJson } from './package';
import { extractFirst, usageText } from './utils';
import { cliExitWithError } from './utils/cli-error';
import { checkForUpdates } from './utils/update-check';

const withPgTeardown = (fn: Function, skipTeardown: boolean = false) => async (...args: any[]) => {
  try {
    await fn(...args);
  } finally {
    if (!skipTeardown) {
      await teardownPgPools();
    }
  }
};

export const createPgpmCommandMap = (skipPgTeardown: boolean = false): Record<string, Function> => {
  const pgt = (fn: Function) => withPgTeardown(fn, skipPgTeardown);
  return {
    add,
    'admin-users': pgt(adminUsers),
    cache,
    clear: pgt(clear),
    deploy: pgt(deploy),
    docker,
    env,
    verify: pgt(verify),
    revert: pgt(revert),
    remove: pgt(remove),
    init: pgt(init),
    extension: pgt(extension),
    plan: pgt(plan),
    export: pgt(_export),
    package: pgt(_package),
    update,
    tag: pgt(tag),
    kill: pgt(kill),
    install: pgt(install),
    migrate: pgt(migrate),
    analyze: pgt(analyze),
    rename: pgt(renameCmd)
  };
};

export const commands = async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions & { skipPgTeardown?: boolean }) => {
  // Fire-and-forget update check (non-blocking) before early exits
  try {
    const pkg = readAndParsePackageJson();
    await checkForUpdates({
      command: argv._?.[0] as string | undefined,
      packageName: pkg.name,
      pkgVersion: pkg.version,
      toolName: pkg.name === '@launchql/cli' ? 'launchql-cli' : pkg.name
    });
  } catch {
    /* silent */
  }

  if (argv.version || argv.v) {
    const pkg = readAndParsePackageJson();
    console.log(pkg.version);
    process.exit(0);
  }

  let { first: command, newArgv } = extractFirst(argv);

  if ((argv.help || argv.h || command === 'help') && !command) {
    console.log(usageText);
    process.exit(0);
  }
  
  if (command === 'help') {
    console.log(usageText);
    process.exit(0);
  }

  const commandMap = createPgpmCommandMap(options?.skipPgTeardown);

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
