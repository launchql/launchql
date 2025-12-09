import { CLIOptions, Inquirerer } from 'inquirerer';

import runModuleSetup from './module';
import runWorkspaceSetup from './workspace';

export const createInitUsageText = (binaryName: string, productLabel?: string): string => {
  const displayName = productLabel ?? binaryName;

  return `
Init Command:

  ${binaryName} init [OPTIONS]

  Initialize ${displayName} workspace or module.

Options:
  --help, -h              Show this help message
  --workspace             Initialize workspace instead of module
  --cwd <directory>       Working directory (default: current directory)
  --repo <repo>           Template repo (default: https://github.com/launchql/pgpm-boilerplates.git)
  --template-path <path>  Template sub-path (default: workspace/module) or local path override
  --from-branch <branch>  Branch/tag to use when cloning repo

Examples:
  ${binaryName} init                                   Initialize new module in existing workspace
  ${binaryName} init --workspace                       Initialize new workspace
  ${binaryName} init --repo owner/repo                 Use templates from GitHub repository
  ${binaryName} init --template-path ./custom-templates Use templates from local path
  ${binaryName} init --repo owner/repo --from-branch develop  Use specific branch
`;
};

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(createInitUsageText('pgpm'));
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
