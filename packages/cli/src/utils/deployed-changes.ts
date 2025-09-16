import { LaunchQLMigrate } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { Inquirerer } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

export async function selectDeployedChange(
  database: string,
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  log: Logger,
  action: 'revert' | 'verify' = 'revert'
): Promise<string | undefined> {
  const pgEnv = getPgEnvOptions({ database });
  const client = new LaunchQLMigrate(pgEnv);

  let selectedPackage: string;

  if (argv.package) {
    selectedPackage = argv.package;
  } else {
    const packageStatuses = await client.status();

    if (packageStatuses.length === 0) {
      log.warn('No deployed packages found in database');
      return undefined;
    }

    const packageAnswer = await prompter.prompt(argv, [{
      type: 'autocomplete',
      name: 'package',
      message: `Select package to ${action} from:`,
      options: packageStatuses.map(status => ({
        name: status.package,
        value: status.package,
        description: `${status.totalDeployed} changes, last: ${status.lastChange}`
      }))
    }]);
    selectedPackage = (packageAnswer as any).package;
  }

  const deployedChanges = await client.getDeployedChanges(database, selectedPackage);

  if (deployedChanges.length === 0) {
    log.warn(`No deployed changes found for package ${selectedPackage}`);
    return undefined;
  }

  const changeAnswer = await prompter.prompt(argv, [{
    type: 'autocomplete',
    name: 'change',
    message: `Select change to ${action} to in ${selectedPackage}:`,
    options: deployedChanges.map(change => ({
      name: change.change_name,
      value: change.change_name,
      description: `Deployed: ${new Date(change.deployed_at).toLocaleString()}`
    }))
  }]);
  const selectedChange = (changeAnswer as any).change;

  return `${selectedPackage}:${selectedChange}`;

}

export async function selectDeployedPackage(
  database: string,
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  log: Logger,
  action: 'revert' | 'verify' = 'revert'
): Promise<string | undefined> {
  if (argv.package) {
    return argv.package;
  }

  const pgEnv = getPgEnvOptions({ database });
  const client = new LaunchQLMigrate(pgEnv);

  const packageStatuses = await client.status();

  if (packageStatuses.length === 0) {
    log.warn('No deployed packages found in database');
    return undefined;
  }

  const packageAnswer = await prompter.prompt(argv, [{
    type: 'autocomplete',
    name: 'package',
    message: `Select package to ${action}:`,
    options: packageStatuses.map(status => ({
      name: status.package,
      value: status.package,
      description: `${status.totalDeployed} changes, last: ${status.lastChange}`
    }))
  }]);

  return (packageAnswer as any).package;
}
