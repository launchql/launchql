import { CLIOptions, Inquirerer } from 'inquirerer';

import runModuleSetup from './module';
import runWorkspaceSetup from './workspace';

const initUsageText = `
LaunchQL Init Command:

  lql init [OPTIONS]

  Initialize LaunchQL workspace or module.

Options:
  --help, -h              Show this help message
  --workspace             Initialize workspace instead of module
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql init                Initialize new module in existing workspace
  lql init --workspace    Initialize new workspace
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(initUsageText);
    process.exit(0);
  }

  return handlePromptFlow(argv, prompter);
};

async function handlePromptFlow(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const { workspace } = argv;

  switch (workspace) {
  case true:
    return runWorkspaceSetup(argv, prompter);
  case false:
  default:
    return runModuleSetup(argv, prompter);
  }
}
