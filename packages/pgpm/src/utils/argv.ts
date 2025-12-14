import { Logger } from '@pgpmjs/logger';
import { ParsedArgs } from 'minimist';

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
  package?: string;
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

  const stringFlags = ['package', 'to', 'database'];
  
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
  if (argv.to && !argv.package && !argv.recursive) {
    log.warn('--to flag provided without --package or --recursive. Target may not work as expected.');
  }

  if (argv.package && argv.recursive) {
    if (argv.package.includes(':')) {
      log.warn('--package should not contain ":" when using --recursive. Use --to for target specification.');
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
    package: argv.package,
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
 * Constructs a deployment target string from package and to arguments
 */
export function constructTarget(argv: ValidatedArgv, packageName?: string): string | undefined {
  if (packageName && argv.to) {
    return `${packageName}:${argv.to}`;
  } else if (packageName) {
    return packageName;
  } else if (argv.package && argv.to) {
    return `${argv.package}:${argv.to}`;
  } else if (argv.package) {
    return argv.package;
  }
  return undefined;
}
