import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors } from '@launchql/types';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { extractFirst } from '../utils/argv';
import { selectPackage } from '../utils/module-utils';
import * as path from 'path';

const log = new Logger('add');

const addUsageText = `
LaunchQL Add Command:

  lql add [change_name] [OPTIONS]

  Add a database change to plans and create deploy/revert/verify SQL files.

Arguments:
  change_name             Name of the change to create

Options:
  --help, -h              Show this help message
  --package <name>        Target specific package
  --requires <dependency> Required change (can be used multiple times)
  --note <text>           Brief note describing the purpose of the change
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql add widgets                                    Add change named 'widgets'
  lql add sprockets --note "Adds the sprockets table"  Add change with note
  lql add contacts --requires users --note "Adds contacts table"  Add with dependency
  lql add be/a/path/like/this                        Add change with nested path
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(addUsageText);
    process.exit(0);
  }
  
  const { first: changeName, newArgv } = extractFirst(argv);
  
  const cwdResult = await prompter.prompt(newArgv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);
  const cwd = (cwdResult as any).cwd || process.cwd();

  const pkg = new LaunchQLPackage(cwd);

  let packageName: string | undefined;
  
  if (argv.package) {
    packageName = argv.package as string;
    log.info(`Using specified package: ${packageName}`);
  }
  else if (pkg.isInModule()) {
    packageName = pkg.getModuleName();
    log.info(`Using current module: ${packageName}`);
  }
  else if (pkg.isInWorkspace()) {
    packageName = await selectPackage(newArgv, prompter, cwd, 'add change to', log);
    if (!packageName) {
      throw new Error('No package selected. Cannot add change without specifying a target package.');
    }
  } else {
    throw new Error('This command must be run inside a LaunchQL workspace or module.');
  }

  const questions: Question[] = [];
  
  if (!changeName) {
    questions.push({
      type: 'text',
      name: 'changeName',
      message: 'Change name',
      required: true,
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return false;
        }
        return true;
      }
    });
  }

  questions.push(
    {
      type: 'text',
      name: 'note',
      message: 'Brief note describing the purpose of the change (optional)',
      required: false
    }
  );

  const answers = await prompter.prompt(newArgv, questions) as any;
  const finalChangeName = changeName || answers.changeName;
  const note = argv.note || answers.note;
  
  let dependencies: string[] = [];
  if (argv.requires) {
    if (Array.isArray(argv.requires)) {
      dependencies = argv.requires;
    } else {
      dependencies = [argv.requires];
    }
  }

  try {
    if (argv.package || !pkg.isInModule()) {
      const moduleMap = pkg.getModuleMap();
      const module = moduleMap[packageName];
      if (!module) {
        throw errors.MODULE_NOT_FOUND({ name: packageName });
      }
      
      const workspacePath = pkg.getWorkspacePath()!;
      const absoluteModulePath = path.resolve(workspacePath, module.path);
      
      const originalCwd = process.cwd();
      process.chdir(absoluteModulePath);
      
      try {
        const modulePkg = new LaunchQLPackage(absoluteModulePath);
        modulePkg.addChange(finalChangeName.trim(), dependencies.length > 0 ? dependencies : undefined, note?.trim() || undefined);
        log.info(`Successfully added change '${finalChangeName}' to package '${packageName}'`);
      } finally {
        process.chdir(originalCwd);
      }
    } else {
      pkg.addChange(finalChangeName.trim(), dependencies.length > 0 ? dependencies : undefined, note?.trim() || undefined);
      log.info(`Successfully added change '${finalChangeName}'`);
    }
  } catch (error) {
    log.error(`Failed to add change: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
  
  return newArgv;
};
