import chalk from 'chalk';

import { readAndParsePackageJson } from '../package';

// Function to display the version information
export function displayVersion() {
  const pkg = readAndParsePackageJson();
  console.log(chalk.green(`Name: ${pkg.name}`));
  console.log(chalk.blue(`Version: ${pkg.version}`));
}

export const usageText = `
  Usage: lql <command> [options]
         launchql <command> [options]
  
  Core Database Operations:
    deploy             Deploy database changes and migrations
    verify             Verify database state and migrations
    revert             Revert database changes and migrations
  
  Project Management:
    init               Initialize LaunchQL workspace or module
    extension          Manage module dependencies
    plan               Generate module deployment plans
    package            Package module for distribution
  
  Development Tools:
    server             Start LaunchQL GraphQL server
    explorer           Launch GraphiQL explorer interface
    export             Export database migrations from existing databases
  
  Database Administration:
    kill               Terminate database connections and optionally drop databases
    install            Install LaunchQL modules
    tag                Add tags to changes for versioning
  
  Migration Tools:
    migrate            Migration management subcommands
      init             Initialize migration tracking
      status           Show migration status
      list             List all changes
      deps             Show change dependencies
  
  Global Options:
    -h, --help         Display this help information
    -v, --version      Display version information
    --cwd <directory>  Working directory (default: current directory)
  
  Individual Command Help:
    lql <command> --help    Display detailed help for specific command
    lql <command> -h        Display detailed help for specific command
  
  Examples:
    lql deploy --help       Show deploy command options
    lql server --port 8080  Start server on port 8080
    lql init --workspace    Initialize new workspace
  `;

export function displayUsage() {
  console.log(usageText);
}
