import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const versionUsageText = `
LaunchQL Version Command:

  lql version [OPTIONS]

  Detect changed packages, bump versions, update dependencies, commit and tag.

Options:
  --help, -h                    Show this help message
  --filter <pattern>            Filter packages by pattern
  --bump <type>                 Bump type: patch|minor|major|prerelease|exact
  --exact <version>             Set exact version (use with --bump exact)
  --cwd <directory>             Working directory (default: current directory)
  --dry-run                     Show what would be done without making changes

Behavior:
  - Detects changed packages since last release/tag
  - Decides bump strategy from conventional commits or --bump flag
  - Updates versions in package.json files
  - Updates internal dependency ranges (respects workspace:* semantics)
  - Runs lql sync per bumped package
  - Stages and commits changes
  - Creates per-package git tags (name@version)

Examples:
  lql version                           Auto-detect changes and bump
  lql version --bump minor              Force minor version bump
  lql version --filter "my-*"           Only process packages matching pattern
  lql version --bump exact --exact 2.0.0  Set exact version
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(versionUsageText);
    return argv;
  }

  const log = new Logger('version');
  
  let { cwd, filter, bump, exact, dryRun } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    },
    {
      type: 'text',
      name: 'filter',
      message: 'Package filter pattern',
      required: false,
      when: () => !argv.filter
    },
    {
      type: 'list',
      name: 'bump',
      message: 'Bump type',
      options: ['patch', 'minor', 'major', 'prerelease', 'exact'],
      required: false,
      when: () => !argv.bump
    },
    {
      type: 'text',
      name: 'exact',
      message: 'Exact version',
      required: false,
      when: (answers) => (answers.bump || argv.bump) === 'exact' && !argv.exact
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Dry run (show changes without applying)?',
      default: false,
      useDefault: true,
      when: () => typeof argv['dry-run'] === 'undefined'
    }
  ]);

  if (argv['dry-run']) dryRun = true;

  log.debug(`Using directory: ${cwd}`);

  const project = new LaunchQLPackage(cwd);
  const result = project.versionWorkspace({
    filter,
    bump: bump as 'patch' | 'minor' | 'major' | 'prerelease' | 'exact',
    exact,
    dryRun
  });

  if (!result.success) {
    log.error(`Version command failed: ${result.message}`);
    throw new Error(result.message);
  }

  if (result.packages.length === 0) {
    log.info(result.message);
    return argv;
  }

  log.info(`Found ${result.packages.length} changed packages:`);
  for (const pkg of result.packages) {
    log.info(`  ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`);
  }

  if (dryRun) {
    log.info('Dry run mode - no changes will be made');
  } else {
    log.success(result.message);
  }

  return argv;
};
