import { PgpmPackage } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { errors } from '@pgpmjs/types';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import * as path from 'path';

import { extractFirst } from '../utils/argv';
import { selectPackage } from '../utils/module-utils';
import { resolvePackageAlias } from '../utils/package-alias';

const log = new Logger('tag');

const tagUsageText = `
Tag Command:

  pgpm tag [tag_name] [OPTIONS]

  Add tags to changes for versioning.

Arguments:
  tag_name                Name of the tag to create

Options:
  --help, -h              Show this help message
  --package <name>        Target specific package
  --changeName <name>     Target specific change (default: latest)
  --comment <text>        Optional tag comment
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm tag v1.0.0                                    Add tag to latest change
  pgpm tag v1.0.0 --comment "Initial release"       Add tag with comment
  pgpm tag v1.1.0 --package mypackage --changeName my-change  Tag specific change in package
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(tagUsageText);
    process.exit(0);
  }
  const { first: tagName, newArgv } = extractFirst(argv);
  
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

  const pkg = new PgpmPackage(cwd);

  let packageName: string | undefined;
  
  if (argv.package) {
    packageName = resolvePackageAlias(argv.package as string, cwd);
    log.info(`Using specified package: ${packageName}`);
  }
  else if (pkg.isInModule()) {
    packageName = pkg.getModuleName();
    log.info(`Using current module: ${packageName}`);
  }
  else if (pkg.isInWorkspace()) {
    packageName = await selectPackage(newArgv, prompter, cwd, 'add tag to', log);
    if (!packageName) {
      throw new Error('No package selected. Cannot add tag without specifying a target package.');
    }
  } else {
    throw new Error('This command must be run inside a PGPM workspace or module.');
  }

  const questions: Question[] = [];
  
  if (!tagName) {
    questions.push({
      type: 'text',
      name: 'tagName',
      message: 'Tag name',
      required: true,
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return false;
        }
        if (value.includes('/')) {
          return false;
        }
        if (value.includes('@')) {
          return false;
        }
        return true;
      }
    });
  }

  questions.push(
    {
      type: 'text',
      name: 'changeName',
      message: 'Target change name (leave empty for latest change)',
      required: false
    },
    {
      type: 'text',
      name: 'comment',
      message: 'Tag comment (optional)',
      required: false
    }
  );

  const answers = await prompter.prompt(newArgv, questions) as any;
  const finalTagName = tagName || answers.tagName;
  const changeName = answers.changeName;
  const comment = answers.comment;

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
        const modulePkg = new PgpmPackage(absoluteModulePath);
        modulePkg.addTag(finalTagName.trim(), changeName?.trim() || undefined, comment?.trim() || undefined);
        log.info(`Successfully added tag '${finalTagName}' to ${changeName || 'latest change'} in package '${packageName}'`);
      } finally {
        process.chdir(originalCwd);
      }
    } else {
      pkg.addTag(finalTagName.trim(), changeName?.trim() || undefined, comment?.trim() || undefined);
      log.info(`Successfully added tag '${finalTagName}' to ${changeName || 'latest change'}`);
    }
  } catch (error) {
    log.error(`Failed to add tag: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
  
  return newArgv;
};
