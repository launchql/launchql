import { UPDATE_CHECK_TTL_MS, UpdateCheckConfig } from '@launchql/types';
import semver from 'semver';

import { readAndParsePackageJson } from '../package';
import { fetchLatestVersion } from './npm-version';
import { readUpdateConfig, shouldCheck, writeUpdateConfig } from './update-config';

interface CheckOptions {
  command?: string;
  packageName?: string;
  pkgVersion?: string;
  toolName?: string;
}

function getCurrentPackageInfo(): { name: string; version: string } {
  const pkg = readAndParsePackageJson();
  return { name: pkg.name || 'pgpm', version: pkg.version || '0.0.0' };
}

function normalizeToolName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-]/g, '-');
}

function configKeyForPackage(packageName: string): string {
  return `${normalizeToolName(packageName)}-update-check`;
}

export async function checkForUpdates(options: CheckOptions = {}): Promise<void> {
  if (process.env.PGPM_SKIP_UPDATE_CHECK === 'true' || process.env.CI === 'true') {
    return;
  }

  if (options.command === 'update') {
    return;
  }

  const { name: pkgNameDefault, version: currentVersion } = getCurrentPackageInfo();
  const packageName = options.packageName || pkgNameDefault;
  const pkgVersion = options.pkgVersion || currentVersion;
  const toolName = options.toolName || normalizeToolName(packageName);
  const configKey = configKeyForPackage(packageName);

  let config: UpdateCheckConfig = readUpdateConfig({ toolName, configKey }) || {};

  const needsCheck = shouldCheck(config.lastCheckedAt, UPDATE_CHECK_TTL_MS);
  if (!needsCheck) {
    maybeWarn(config, pkgVersion, packageName, { toolName, configKey });
    return;
  }

  const latest = await fetchLatestVersion(packageName);
  const now = Date.now();

  if (latest) {
    config.latestKnownVersion = latest;
    config.lastCheckedAt = now;
  } else {
    // record check attempt to avoid repeated hits if npm is unavailable
    config.lastCheckedAt = now;
  }

  writeUpdateConfig(config, { toolName, configKey });
  maybeWarn(config, pkgVersion, packageName, { toolName, configKey });
}

function maybeWarn(
  config: UpdateCheckConfig,
  currentVersion: string,
  packageName: string,
  opts: { toolName: string; configKey: string }
) {
  if (!config.latestKnownVersion) return;
  if (!semver.valid(currentVersion) || !semver.valid(config.latestKnownVersion)) return;

  if (semver.gte(currentVersion, config.latestKnownVersion)) return;

  if (config.lastPromptedVersion === config.latestKnownVersion) return;

  const updateCmd = packageName === 'pgpm'
    ? 'pgpm update'
    : `npm install -g ${packageName}`;

  // eslint-disable-next-line no-console
  console.warn(
    `A new version of ${packageName} is available (current: ${currentVersion}, latest: ${config.latestKnownVersion}). Run ${updateCmd} to upgrade.`
  );

  config.lastPromptedVersion = config.latestKnownVersion;
  writeUpdateConfig(config, { toolName: opts.toolName, configKey: opts.configKey });
}
