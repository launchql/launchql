import { Logger } from '@launchql/logger';
import { Inquirerer } from 'inquirerer';
import { spawn } from 'child_process';

import { readAndParsePackageJson } from '../package';
import { fetchLatestVersion } from '../utils/npm-version';

const log = new Logger('update');

export default async function updateCmd(argv: Record<string, any>, _prompter: Inquirerer) {
  const pkg = readAndParsePackageJson();
  const packageName = pkg.name || 'pgpm';

  log.info(`Updating ${packageName} via npm...`);

  const success = await runNpmInstall(packageName);
  if (!success) {
    log.error('Failed to update. Please ensure npm is available and you have permission to install global packages.');
    process.exit(1);
  }

  const latest = await fetchLatestVersion(packageName);
  if (latest) {
    log.success(`Successfully updated ${packageName} to ${latest}.`);
  } else {
    log.success(`Update command finished for ${packageName}.`);
  }
}

function runNpmInstall(packageName: string): Promise<boolean> {
  return new Promise(resolve => {
    const child = spawn('npm', ['install', '-g', packageName], {
      stdio: 'inherit',
    });

    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}
