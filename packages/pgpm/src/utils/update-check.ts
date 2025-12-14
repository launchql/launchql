import { findAndRequirePackageJson } from 'find-and-require-package-json';
import { Logger } from '@pgpmjs/logger';
import {
  UpdateCheckConfig,
  UPDATE_CHECK_APPSTASH_KEY,
  UPDATE_CHECK_TTL_MS,
  UPDATE_PACKAGE_NAME
} from '@pgpmjs/types';
import { compareVersions, fetchLatestVersion } from './npm-version';
import { readUpdateConfig, shouldCheck, writeUpdateConfig, UpdateConfigOptions } from './update-config';

export interface CheckForUpdatesOptions extends UpdateConfigOptions {
  pkgName?: string;
  pkgVersion?: string;
  command?: string;
  now?: number;
  updateCommand?: string;
}

const log = new Logger('update-check');

const shouldSkip = (command?: string): boolean => {
  if (process.env.PGPM_SKIP_UPDATE_CHECK) return true;
  if (process.env.CI === 'true') return true;
  if (command === 'update') return true;
  return false;
};

export async function checkForUpdates(options: CheckForUpdatesOptions = {}): Promise<UpdateCheckConfig | null> {
  const {
    pkgName = UPDATE_PACKAGE_NAME,
    pkgVersion = findAndRequirePackageJson(__dirname).version,
    command,
    now = Date.now(),
    key = UPDATE_CHECK_APPSTASH_KEY,
    toolName,
    baseDir
  } = options;

  if (shouldSkip(command)) {
    return null;
  }

  try {
    const existing = await readUpdateConfig({ toolName, baseDir, key });
    let latestKnownVersion = existing?.latestKnownVersion ?? pkgVersion;

    const needsCheck = shouldCheck(now, existing?.lastCheckedAt, UPDATE_CHECK_TTL_MS);

    if (needsCheck) {
      const fetched = await fetchLatestVersion(pkgName);
      if (fetched) {
        latestKnownVersion = fetched;
      }

      await writeUpdateConfig(
        {
          lastCheckedAt: now,
          latestKnownVersion
        },
        { toolName, baseDir, key }
      );
    }

    const comparison = compareVersions(pkgVersion, latestKnownVersion);
    const isOutdated = comparison < 0;

    if (isOutdated) {
      const defaultUpdateCommand =
        pkgName === UPDATE_PACKAGE_NAME
          ? 'Run pgpm update to upgrade.'
          : `Run npm i -g ${pkgName}@latest to upgrade.`;
      const updateInstruction = options.updateCommand ?? defaultUpdateCommand;

      log.warn(
        `A new version of ${pkgName} is available (current ${pkgVersion}, latest ${latestKnownVersion}). ${updateInstruction}`
      );

      await writeUpdateConfig(
        {
          lastCheckedAt: now,
          latestKnownVersion
        },
        { toolName, baseDir, key }
      );
    }

    return {
      lastCheckedAt: now,
      latestKnownVersion
    };
  } catch (error) {
    log.debug('Update check skipped due to error:', error);
    return null;
  }
}
