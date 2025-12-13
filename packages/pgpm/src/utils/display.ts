import { findAndRequirePackageJson } from 'find-and-require-package-json';
import yanse from 'yanse';

// Function to display the version information
export function displayVersion() {
  const pkg = findAndRequirePackageJson(__dirname);
  console.log(yanse.green(`Name: ${pkg.name}`));
  console.log(yanse.blue(`Version: ${pkg.version}`));
}

export const usageText = `
  Usage: pgpm <command> [options]
  
  Core Database Operations:
    add                Add database changes to plans and create SQL files
    deploy             Deploy database changes and migrations
    verify             Verify database state and migrations
    revert             Revert database changes and migrations
  
  Project Management:
    init               Initialize workspace or module
    extension          Manage module dependencies
    plan               Generate module deployment plans
    package            Package module for distribution
    export             Export database migrations from existing databases
    update             Update pgpm to the latest version
    cache              Manage cached templates (clean)
  
  Database Administration:
    kill               Terminate database connections and optionally drop databases
    install            Install database modules
    tag                Add tags to changes for versioning
    clear              Clear database state
    remove             Remove database changes
    analyze            Analyze database structure
    rename             Rename database changes
    admin-users        Manage admin users
  
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
    pgpm <command> --help    Display detailed help for specific command
    pgpm <command> -h        Display detailed help for specific command
  
  Examples:
    pgpm deploy --help       Show deploy command options
    pgpm init workspace      Initialize new workspace
    pgpm install @pgpm/base32  Install a database module
  `;

export function displayUsage() {
  console.log(usageText);
}
