import chalk from 'chalk';

import { readAndParsePackageJson } from '../package';

// Function to display the version information
export function displayVersion() {
  const pkg = readAndParsePackageJson();
  console.log(chalk.green(`Name: ${pkg.name}`));
  console.log(chalk.blue(`Version: ${pkg.version}`));
}

export const usageText = `
  Usage: pgpm <command> [options]
  
  Core Database Operations:
    add                Add database changes to plans and create SQL files
    deploy             Deploy database changes and migrations
    verify             Verify database state and migrations
    revert             Revert database changes and migrations
  
  Project Management:
    init               Initialize LaunchQL workspace or module
    extension          Manage module dependencies
    plan               Generate module deployment plans
    package            Package module for distribution
  
  Database Administration:
    install            Install LaunchQL modules
    tag                Add tags to changes for versioning
    clear              Clear all changes from the plan
    admin-users        Manage database users and roles
  
  Migration Tools:
    migrate            Migration management subcommands
      init             Initialize migration tracking
      status           Show migration status
      list             List all changes
      deps             Show change dependencies
  
  Other Commands:
    export             Export database migrations from existing databases
    analyze            Analyze module dependencies
    rename             Rename changes in the plan
    remove             Remove changes from the plan
  
  Global Options:
    -h, --help         Display this help information
    -v, --version      Display version information
    --cwd <directory>  Working directory (default: current directory)
  
  Individual Command Help:
    pgpm <command> --help    Display detailed help for specific command
    pgpm <command> -h        Display detailed help for specific command
  
  Examples:
    pgpm deploy --help       Show deploy command options
    pgpm init --workspace    Initialize new workspace
    pgpm add my-change       Add a new change to the plan
  `;

export function displayUsage() {
  console.log(usageText);
}
