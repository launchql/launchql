import { CLIOptions, Inquirerer } from 'inquirerer';

import runModuleSetup from './module';
import runWorkspaceSetup from './workspace';

const initUsageText = `
Init Command:

  pgpm init [OPTIONS]

  Initialize pgpm workspace or module.

Options:
  --help, -h              Show this help message
  --workspace             Initialize workspace instead of module
  --cwd <directory>       Working directory (default: current directory)
  --repo <repo>           Use templates from GitHub repository (e.g., owner/repo)
  --template-path <path>   Use templates from local path
  --from-branch <branch>   Specify branch when using --repo (default: main)

Examples:
  pgpm init                                  Initialize new module in existing workspace
  pgpm init --workspace                       Initialize new workspace
  pgpm init --repo owner/repo                Use templates from GitHub repository
  pgpm init --template-path ./custom-templates Use templates from local path
  pgpm init --repo owner/repo --from-branch develop  Use specific branch
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

