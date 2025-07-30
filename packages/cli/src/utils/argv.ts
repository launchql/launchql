import { ParsedArgs } from 'minimist';
import { Logger } from '@launchql/logger';

const log = new Logger('argv-utils');

export const extractFirst = (argv: Partial<ParsedArgs>) => {
  const first = argv._?.[0];
  const newArgv = {
    ...argv,
    _: argv._?.slice(1) ?? []
  };
  return { first, newArgv };
};

/**
 * Common CLI argument validation and processing utilities
 */

export interface ValidatedArgv extends ParsedArgs {
  cwd: string;
  database?: string;
  project?: string;
  to?: string;
  recursive?: boolean;
  yes?: boolean;
  tx?: boolean;
  fast?: boolean;
  logOnly?: boolean;
  createdb?: boolean;
  usePlan?: boolean;
  cache?: boolean;
  drop?: boolean;
  all?: boolean;
  summary?: boolean;
  help?: boolean;
  h?: boolean;
}

/**
 * Validates and normalizes common CLI arguments
 */
export function validateCommonArgs(argv: Partial<ParsedArgs>): ValidatedArgv {
  const validated: ValidatedArgv = {
    ...argv,
    cwd: argv.cwd || process.cwd(),
    _: argv._ || []
  };

  const booleanFlags = ['recursive', 'yes', 'tx', 'fast', 'logOnly', 'createdb', 'usePlan', 'cache', 'drop', 'all', 'summary', 'help', 'h'];
  
  for (const flag of booleanFlags) {
    if (argv[flag] !== undefined && typeof argv[flag] !== 'boolean') {
      log.warn(`--${flag} flag should be boolean, converting to true`);
      validated[flag] = true;
    }
  }

  const stringFlags = ['project', 'to', 'database'];
  
  for (const flag of stringFlags) {
    if (argv[flag] !== undefined && typeof argv[flag] !== 'string') {
      log.warn(`--${flag} should be a string, converting`);
      validated[flag] = String(argv[flag]);
    }
  }

  return validated;
}

/**
 * Checks if required flags are provided when certain conditions are met
 */
export function validateFlagDependencies(argv: ValidatedArgv): void {
  if (argv.to && !argv.project && !argv.recursive) {
    log.warn('--to flag provided without --project or --recursive. Target may not work as expected.');
  }

  if (argv.project && argv.recursive) {
    if (argv.project.includes(':')) {
      log.warn('--project should not contain ":" when using --recursive. Use --to for target specification.');
    }
  }
}

/**
 * Logs the effective CLI arguments for debugging
 */
export function logEffectiveArgs(argv: ValidatedArgv, commandName: string): void {
  const relevantArgs = {
    cwd: argv.cwd,
    database: argv.database,
    project: argv.project,
    to: argv.to,
    recursive: argv.recursive,
    yes: argv.yes,
    tx: argv.tx,
    fast: argv.fast,
    logOnly: argv.logOnly,
    createdb: argv.createdb,
    usePlan: argv.usePlan,
    cache: argv.cache,
    drop: argv.drop,
    all: argv.all,
    summary: argv.summary
  };
  
  const definedArgs = Object.fromEntries(
    Object.entries(relevantArgs).filter(([_, value]) => value !== undefined)
  );
  
  if (Object.keys(definedArgs).length > 1) { // More than just cwd
    log.debug(`${commandName} effective arguments:`, definedArgs);
  }
}

/**
 * Constructs a deployment target string from project and to arguments
 */
export function constructTarget(argv: ValidatedArgv, projectName?: string): string | undefined {
  if (projectName && argv.to) {
    return `${projectName}:${argv.to}`;
  } else if (projectName) {
    return projectName;
  } else if (argv.project && argv.to) {
    return `${argv.project}:${argv.to}`;
  } else if (argv.project) {
    return argv.project;
  }
  return undefined;
}
