import { Logger } from '@launchql/logger';
import {
  UpdateCheckConfig,
  UPDATE_CHECK_APPSTASH_KEY,
  UPDATE_CHECK_TTL_MS,
  UPDATE_PACKAGE_NAME
} from '@launchql/types';
import { readAndParsePackageJson } from '../package';
import { compareVersions, fetchLatestVersion } from './npm-version';
import { readUpdateConfig, shouldCheck, writeUpdateConfig, UpdateConfigOptions } from './update-config';

export interface CheckForUpdatesOptions extends UpdateConfigOptions {
  pkgName?: string;
  pkgVersion?: string;
  command?: string;
  now?: number;
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
    pkgVersion = readAndParsePackageJson().version,
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
          latestKnownVersion,
          lastPromptedVersion: existing?.lastPromptedVersion
        },
        { toolName, baseDir, key }
      );
    }

    const comparison = compareVersions(pkgVersion, latestKnownVersion);
    const isOutdated = comparison < 0;

    if (isOutdated && existing?.lastPromptedVersion !== latestKnownVersion) {
      log.warn(
        `A new version of ${pkgName} is available (current ${pkgVersion}, latest ${latestKnownVersion}). Run pgpm update to upgrade.`
      );

      await writeUpdateConfig(
        {
          lastCheckedAt: now,
          latestKnownVersion,
          lastPromptedVersion: latestKnownVersion
        },
        { toolName, baseDir, key }
      );
    }

    return {
      lastCheckedAt: now,
      latestKnownVersion,
      lastPromptedVersion: isOutdated ? latestKnownVersion : existing?.lastPromptedVersion
    };
  } catch (error) {
    log.debug('Update check skipped due to error:', error);
    return null;
  }
}
