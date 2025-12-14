import { findAndRequirePackageJson } from 'find-and-require-package-json';
import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { spawn } from 'child_process';
import { fetchLatestVersion } from '../utils/npm-version';
import { cliExitWithError } from '../utils/cli-error';

const log = new Logger('update');

const updateUsageText = `
Update Command:

  pgpm update [OPTIONS]

  Install the latest version of pgpm from npm.

Options:
  --help, -h          Show this help message
  --package <name>    Override the package name (default: package.json name)
  --registry <url>    Use a custom npm registry
  --dry-run           Print the npm command without executing it
`;

const runNpmInstall = (pkgName: string, registry?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const args = ['install', '-g', pkgName];
    if (registry) {
      args.push('--registry', registry);
    }

    const child = spawn('npm', args, { stdio: 'inherit' });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install exited with code ${code}`));
      }
    });
  });
};

export default async (
  argv: Partial<Record<string, any>>,
  _prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(updateUsageText);
    process.exit(0);
  }

  const pkgJson = findAndRequirePackageJson(__dirname);
  const pkgName = (argv.package as string) || pkgJson.name || 'pgpm';
  const registry = argv.registry as string | undefined;
  const dryRun = Boolean(argv['dry-run']);

  const npmCommand = `npm install -g ${pkgName}${registry ? ` --registry ${registry}` : ''}`;

  if (dryRun) {
    log.info(`[dry-run] ${npmCommand}`);
    return argv;
  }

  log.info(`Running: ${npmCommand}`);

  try {
    await runNpmInstall(pkgName, registry);
    const latest = await fetchLatestVersion(pkgName);
    if (latest) {
      log.success(`Successfully updated ${pkgName} to version ${latest}.`);
    } else {
      log.success(`npm install completed for ${pkgName}.`);
    }
  } catch (error: any) {
    await cliExitWithError(
      error instanceof Error ? error.message : String(error),
      { package: pkgName, registry }
    );
  }

  return argv;
};
