import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Logger } from '@launchql/logger';

const logger = new Logger('update-check');

interface UpdateState {
  lastUpdateCheck?: string;
  lastPublished?: string;
  commandCount: number;
  lastSeenLatestVersion?: string;
}

const UPDATE_CHECK_FREQUENCY = 24 * 60 * 60 * 1000;
const PUBLISH_AGE_THRESHOLD = 7 * 24 * 60 * 60 * 1000;

function getStateDir(): string {
  const stateDir = process.env.LAUNCHQL_STATE_DIR || 
    (process.platform === 'darwin' 
      ? join(homedir(), 'Library', 'Application Support', 'LaunchQL')
      : process.platform === 'win32'
      ? join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'LaunchQL')
      : join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'launchql'));
  
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }
  
  return stateDir;
}

function shouldSkipUpdateCheck(command?: string): boolean {
  if (process.env.LAUNCHQL_SKIP_UPDATE_CHECK === '1') {
    logger.debug('Skipping update check: LAUNCHQL_SKIP_UPDATE_CHECK=1');
    return true;
  }

  if (process.env.LAUNCHQL_FORCE_UPDATE_CHECK === '1') {
    logger.debug('Forcing update check: LAUNCHQL_FORCE_UPDATE_CHECK=1');
    return false;
  }

  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    logger.debug('Skipping update check: test environment detected');
    return true;
  }

  if (process.env.CI) {
    logger.debug('Skipping update check: CI environment detected');
    return true;
  }

  if (!process.stdout.isTTY) {
    logger.debug('Skipping update check: not a TTY');
    return true;
  }

  if (command === 'upgrade') {
    logger.debug('Skipping update check: running upgrade command');
    return true;
  }

  return false;
}

function readState(packageName: string): UpdateState {
  const stateFile = join(getStateDir(), `${packageName.replace('@', '').replace('/', '-')}-state.json`);
  
  if (!existsSync(stateFile)) {
    return { commandCount: 0 };
  }

  try {
    const content = readFileSync(stateFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.debug('Failed to read state file:', error);
    return { commandCount: 0 };
  }
}

function writeState(packageName: string, state: UpdateState): void {
  const stateFile = join(getStateDir(), `${packageName.replace('@', '').replace('/', '-')}-state.json`);
  
  try {
    writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    logger.debug('Failed to write state file:', error);
  }
}

function shouldCheckForUpdates(state: UpdateState): boolean {
  if (state.commandCount % 10 !== 0) {
    logger.debug(`Skipping update check: commandCount=${state.commandCount} (not modulo 10)`);
    return false;
  }

  if (!state.lastUpdateCheck) {
    logger.debug('No previous update check found, will check now');
    return true;
  }

  const timeSinceLastCheck = Date.now() - new Date(state.lastUpdateCheck).valueOf();
  if (timeSinceLastCheck < UPDATE_CHECK_FREQUENCY) {
    logger.debug(`Skipping update check: last checked ${Math.round(timeSinceLastCheck / 1000 / 60 / 60)}h ago (< 24h)`);
    return false;
  }

  logger.debug('Update check conditions met (modulo 10 + 24h elapsed)');
  return true;
}

async function fetchLatestVersion(packageName: string): Promise<{ version: string; publishedDate: Date } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://registry.npmjs.org/${packageName}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      logger.debug(`Registry request failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const latestVersion = data['dist-tags']?.latest;
    
    if (!latestVersion) {
      logger.debug('No latest version found in registry response');
      return null;
    }

    const publishedDate = data.time?.[latestVersion] 
      ? new Date(data.time[latestVersion])
      : new Date();

    return { version: latestVersion, publishedDate };
  } catch (error) {
    logger.debug('Failed to fetch latest version:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

function shouldWarnAboutUpdate(
  currentVersion: string,
  latestVersion: string,
  publishedDate: Date,
  lastSeenLatestVersion?: string
): boolean {
  if (compareVersions(currentVersion, latestVersion) >= 0) {
    logger.debug(`Current version ${currentVersion} is up to date (latest: ${latestVersion})`);
    return false;
  }

  if (lastSeenLatestVersion === latestVersion) {
    logger.debug(`Already warned about version ${latestVersion}, skipping repeat warning`);
    return false;
  }

  const publishAge = Date.now() - publishedDate.valueOf();
  if (publishAge < PUBLISH_AGE_THRESHOLD) {
    const daysOld = Math.round(publishAge / 1000 / 60 / 60 / 24);
    logger.debug(`Latest version ${latestVersion} was published ${daysOld} days ago (< 7 days), skipping warning`);
    return false;
  }

  return true;
}

export async function checkForUpdates(
  packageName: string,
  currentVersion: string,
  command?: string
): Promise<void> {
  if (shouldSkipUpdateCheck(command)) {
    return;
  }

  const state = readState(packageName);
  state.commandCount += 1;
  writeState(packageName, state);

  if (!shouldCheckForUpdates(state)) {
    return;
  }

  const latestInfo = await fetchLatestVersion(packageName);
  
  const now = new Date().toUTCString();
  state.lastUpdateCheck = now;
  
  if (latestInfo) {
    state.lastPublished = latestInfo.publishedDate.toUTCString();
    
    logger.debug({
      currentVersion,
      latestVersion: latestInfo.version,
      publishedDate: latestInfo.publishedDate.toUTCString()
    });

    if (shouldWarnAboutUpdate(currentVersion, latestInfo.version, latestInfo.publishedDate, state.lastSeenLatestVersion)) {
      state.lastSeenLatestVersion = latestInfo.version;
      
      const cliName = packageName === '@launchql/cli' ? 'lql' : 'pgpm';
      logger.warn(`A new version of ${packageName} is available: ${latestInfo.version} (current: ${currentVersion})`);
      logger.info(`Run '${cliName} upgrade' to update.`);
    }
  }
  
  writeState(packageName, state);
}
