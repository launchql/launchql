import chalk from 'chalk';
import { readAndParsePackageJson } from '../package';

// Function to display the version information
export function displayVersion() {
  const pkg = readAndParsePackageJson();
  console.log(chalk.green(`Name: ${pkg.name}`));
  console.log(chalk.blue(`Version: ${pkg.version}`));
}

export const usageText = `
  Usage: launchql <command> [options]
  
  Commands:
    start              Start the Launchql services.
    version, -v        Display the version of the Starship Client.
  
  Configuration File:
    --config <path>       Specify the path to the configuration file containing the actual config file. Required.
                          Command-line options will override settings from this file if both are provided.
  
  Additional Help:
    $ launchql help          Display this help information.
  `;

export function displayUsage() {
  console.log(usageText);
}