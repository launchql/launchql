import { CLIOptions, Inquirerer } from 'inquirerer';
import { Logger } from '@launchql/logger';
import { listAvailableBoilerplates } from '../../utils/boilerplate';

import runModuleSetup from './module';
import runWorkspaceSetup from './workspace';

const log = new Logger('init');

const initUsageText = `
Init Command:

  pgpm init [OPTIONS]

  Initialize pgpm workspace or module.

Options:
  --help, -h              Show this help message
  --workspace             Initialize workspace instead of module
  --boilerplate           List available boilerplates (no default, lists all)
  --cwd <directory>       Working directory (default: current directory)
  --repo <repo>           Use templates from GitHub repository (default: launchql/pgpm-boilerplates)
  --from-branch <branch>  Specify branch when using --repo (default: main)

Examples:
  pgpm init                                  Initialize new module (defaults to 'module' boilerplate)
  pgpm init --workspace                      Initialize new workspace (defaults to 'workspace' boilerplate)
  pgpm init --boilerplate                    List all available boilerplates
  pgpm init --boilerplate custom-module      Use 'custom-module' boilerplate
  pgpm init --repo owner/repo                Use templates from GitHub repository
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

  if (argv.boilerplate === true) {
    return listBoilerplates(argv);
  }

  return handlePromptFlow(argv, prompter);
};

async function listBoilerplates(argv: Partial<Record<string, any>>) {
  const boilerplateOptions = {
    repo: argv.repo as string | undefined,
    branch: argv.fromBranch as string | undefined
  };

  log.info('Fetching available boilerplates...');
  
  try {
    const boilerplates = listAvailableBoilerplates(boilerplateOptions);
    
    console.log('\nAvailable boilerplates:');
    boilerplates.forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('\nUsage: pgpm init --boilerplate <name>');
    
    return { ...argv, boilerplates };
  } catch (error) {
    log.error('Failed to list boilerplates:', error);
    throw error;
  }
}

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

