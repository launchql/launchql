import { LaunchQLPackage } from '@launchql/core';
import { errors } from '@launchql/types';
import { Logger } from '@launchql/logger';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

/**
 * Handle package selection for operations that need a specific package
 * Returns the selected package name, or undefined if validation fails or no packages exist
 */
export async function selectPackage(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  cwd: string,
  operationName: string,
  log?: Logger
): Promise<string | undefined> {
  const packageInstance = new LaunchQLPackage(cwd);
  const modules = await packageInstance.getModules();
  const moduleNames = modules.map(mod => mod.getModuleName());

  // Check if any modules exist
  if (!moduleNames.length) {
    const errorMsg = 'No modules found in the specified directory.';
    if (log) {
      log.error(errorMsg);
      return undefined;
    } else {
      prompter.close();
      throw errors.NOT_FOUND({}, errorMsg);
    }
  }

  // If a specific package was provided, validate it
  if (argv.package) {
    const packageName = argv.package as string;
    if (log) log.info(`Using specified package: ${packageName}`);
    
    if (!moduleNames.includes(packageName)) {
      const errorMsg = `Package '${packageName}' not found. Available packages: ${moduleNames.join(', ')}`;
      if (log) {
        log.error(errorMsg);
        return undefined;
      } else {
        throw errors.NOT_FOUND({}, errorMsg);
      }
    }
    
    return packageName;
  }

  // Interactive selection
  const { package: selectedPackage } = await prompter.prompt(argv, [{
    type: 'autocomplete',
    name: 'package',
    message: `Choose a package to ${operationName}`,
    options: moduleNames,
    required: true
  }]);

  if (log) log.info(`Selected package: ${selectedPackage}`);
  return selectedPackage;
}
