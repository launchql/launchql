import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { CacheManager } from 'create-gen-app';
import { cliExitWithError } from '../utils/cli-error';

const log = new Logger('cache');

const cacheUsageText = `
Cache Command:

  pgpm cache clean [OPTIONS]

Options:
  --help, -h          Show this help message
  --tool <name>       Cache namespace to clear (default: pgpm)
`;

export default async (
  argv: Partial<Record<string, any>>,
  _prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(cacheUsageText);
    process.exit(0);
  }

  const action = (argv._?.[0] as string) || 'clean';
  if (action !== 'clean') {
    console.log(cacheUsageText);
    await cliExitWithError(`Unknown cache action: ${action}`);
  }

  const toolName = (argv.tool as string) || 'pgpm';
  const cacheManager = new CacheManager({ toolName });

  cacheManager.clearAll();
  log.success(`Cleared template cache for "${toolName}".`);
  log.debug(`Cache location: ${cacheManager.getReposDir()}`);

  return argv;
};
