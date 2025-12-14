import { PgpmPackage } from '@pgpmjs/core';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { extractFirst } from '../utils/argv';

const addUsageText = `
Add Command:

  pgpm add [change] [OPTIONS]

  Add a database change to plans and create deploy/revert/verify SQL files.

Arguments:
  change                  Name of the change to create

Options:
  --help, -h              Show this help message
  --requires <dependency> Required change (can be used multiple times)
  --note <text>           Brief note describing the purpose of the change
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm add organizations                                    Add change named 'organizations'
  pgpm add brands --note "Adds the brands table"  Add change with note
  pgpm add contacts --requires users --note "Adds contacts table"  Add with dependency
  pgpm add be/a/path/like/this                        Add change with nested path
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(addUsageText);
    process.exit(0);
  }
  
  const cwd = (argv.cwd as string) || process.cwd();
  const { first: change, newArgv } = extractFirst(argv);
  
  let finalChange = change;
  
  if (!change) {
    const answers = await prompter.prompt(newArgv, [{
      type: 'text',
      name: 'change',
      message: 'Change name',
      required: true
    }]) as any;
    finalChange = answers.change;
  }

  let dependencies: string[] = [];
  if (argv.requires) {
    dependencies = Array.isArray(argv.requires) ? argv.requires : [argv.requires];
  }

  const pkg = new PgpmPackage(path.resolve(cwd));
  pkg.addChange(finalChange, dependencies.length > 0 ? dependencies : undefined, argv.note);
  
  return newArgv;
};
