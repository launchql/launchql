import { ParsedArgs } from 'minimist';
import { DEFAULT_TEMPLATE_REPO } from '@pgpmjs/core';

export const addInitDefaults = (argv: ParsedArgs): ParsedArgs => {
  const baseName = (argv.moduleName as string) || (argv.name as string) || 'module';

  const defaults = {
    fullName: 'Tester',
    email: 'tester@example.com',
    moduleName: argv.workspace ? 'starter-module' : baseName,
    username: 'tester',
    repoName: baseName,
    license: 'MIT',
    access: 'public',
    packageIdentifier: baseName,
    moduleDesc: baseName
  };

  return { ...defaults, ...argv };
};

export const withInitDefaults = (argv: ParsedArgs, defaultRepo: string = DEFAULT_TEMPLATE_REPO): ParsedArgs => {
  const args = addInitDefaults(argv);
  if (!Array.isArray(args._) || !args._.includes('init')) return args;

  return {
    ...args,
    repo: args.repo ?? defaultRepo,
    // TODO: remove fromBranch after merging restructuring to main
    fromBranch: args.fromBranch ?? 'restructuring'
    // Don't set default templatePath - let scaffoldTemplate use metadata-driven resolution from .boilerplates.json
  };
};
