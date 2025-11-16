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
  --template <url>        Template repository URL or GitHub shorthand (e.g., owner/repo)

Examples:
  pgpm init                                  Initialize new module in existing workspace
  pgpm init --workspace                      Initialize new workspace
  pgpm init --template owner/repo            Use templates from GitHub repository
  pgpm init --template https://github.com/owner/repo.git  Use full GitHub URL
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
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
