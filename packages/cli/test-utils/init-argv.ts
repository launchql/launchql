import { ParsedArgs } from 'minimist';

const DEFAULT_REPO = 'https://github.com/launchql/pgpm-boilerplates.git';

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

export const withInitDefaults = (argv: ParsedArgs, defaultRepo: string = DEFAULT_REPO): ParsedArgs => {
  const args = addInitDefaults(argv);
  if (!Array.isArray(args._) || !args._.includes('init')) return args;

  return {
    ...args,
    repo: args.repo ?? defaultRepo,
    templatePath: args.templatePath ?? (args.workspace ? 'workspace' : 'module')
  };
};

