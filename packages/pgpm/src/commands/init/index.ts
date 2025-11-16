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
  --template-path <path>  Use templates from local path
  --from-branch <branch>  Specify branch when using --repo (default: main)
  --dry-run               Show what would be created without creating files
  --show-vars             Display all resolved variables
  --strict                Fail on missing variables (default: true)
  --no-strict             Allow undefined variables (not recommended)
  --non-interactive       Use defaults and provided values without prompting
  --verbose               Show detailed information during initialization

Examples:
  pgpm init                                  Initialize new module in existing workspace
  pgpm init --workspace                      Initialize new workspace
  pgpm init --repo owner/repo                Use templates from GitHub repository
  pgpm init --template-path ./custom-templates Use templates from local path
  pgpm init --repo owner/repo --from-branch develop  Use specific branch
  pgpm init --dry-run                        Preview what would be created
  pgpm init --show-vars                      Display all resolved variables
  pgpm init --non-interactive --modulename=my-module  Non-interactive initialization
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

