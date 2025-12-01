import { CLIOptions, Inquirerer } from 'inquirerer';

import { clearCreateGenAppCache, DEFAULT_TOOL_NAME } from './init/create-gen-app';

const cacheUsageText = `
Cache Command:

  pgpm cache clean

  Clear cached template repositories (shared with lql) stored under the "${DEFAULT_TOOL_NAME}" namespace.

Options:
  --help, -h              Show this help message

Examples:
  pgpm cache clean        Clear cached boilerplates
`;

export default async (
  argv: Partial<Record<string, any>>,
  _prompter: Inquirerer,
  _options: CLIOptions
) => {
  const subcommand = (argv._?.[0] as string) ?? '';

  if (argv.help || argv.h || !subcommand) {
    console.log(cacheUsageText);
    process.exit(0);
  }

  if (subcommand !== 'clean') {
    console.log(cacheUsageText);
    process.exit(1);
  }

  clearCreateGenAppCache();
  console.log('✨ Cache cleared successfully!');

  return argv;
};
