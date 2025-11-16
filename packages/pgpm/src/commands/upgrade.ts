import { execSync } from 'child_process';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { readAndParsePackageJson } from '../package';
import { cliExitWithError } from '../utils/cli-error';

const upgradeUsageText = `
Usage: pgpm upgrade [OPTIONS]

Upgrade pgpm to the latest version from npm.

Options:
  --help, -h     Show this help message
  --yes, -y      Skip confirmation prompt

Examples:
  pgpm upgrade
  pgpm upgrade --yes
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(upgradeUsageText);
    process.exit(0);
  }

  const pkg = readAndParsePackageJson();
  const packageName = pkg.name;

  console.log(`Current version: ${pkg.version}`);
  console.log(`Checking for updates...`);

  try {
    const latestVersionOutput = execSync(`npm view ${packageName} version`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    if (latestVersionOutput === pkg.version) {
      console.log(`You are already on the latest version (${pkg.version})`);
      return;
    }

    console.log(`Latest version available: ${latestVersionOutput}`);

    const answers = await prompter.prompt(argv, [
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Do you want to upgrade from ${pkg.version} to ${latestVersionOutput}?`,
        required: true
      }
    ]);

    if (!answers.confirmed) {
      console.log('Upgrade cancelled.');
      return;
    }

    console.log(`Upgrading ${packageName}...`);
    
    execSync(`npm install -g ${packageName}`, {
      stdio: 'inherit'
    });

    console.log(`Successfully upgraded to ${latestVersionOutput}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await cliExitWithError(`Failed to upgrade: ${errorMessage}`);
  }
};
