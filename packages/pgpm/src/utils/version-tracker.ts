import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface VersionInfo {
  name: string;
  version: string;
  commandCount: number;
  lastUpdateCheck: number; // timestamp in milliseconds
  lastPublished?: number; // timestamp in milliseconds
}

export class VersionTracker {
  private configDir: string;
  private configFile: string;
  private packageName: string;
  private currentVersion: string;

  constructor(packageName: string, currentVersion: string) {
    this.packageName = packageName;
    this.currentVersion = currentVersion;
    this.configDir = join(homedir(), '.launchql');
    this.configFile = join(this.configDir, 'version-info.json');
    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
  }

  private readVersionInfo(): Record<string, VersionInfo> {
    if (!existsSync(this.configFile)) {
      return {};
    }
    try {
      const content = readFileSync(this.configFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  private writeVersionInfo(info: Record<string, VersionInfo>): void {
    writeFileSync(this.configFile, JSON.stringify(info, null, 2), 'utf8');
  }

  public getVersionInfo(): VersionInfo {
    const allInfo = this.readVersionInfo();
    return allInfo[this.packageName] || {
      name: this.packageName,
      version: this.currentVersion,
      commandCount: 0,
      lastUpdateCheck: 0
    };
  }

  public incrementCommandCount(): void {
    const allInfo = this.readVersionInfo();
    const info = this.getVersionInfo();
    info.commandCount += 1;
    allInfo[this.packageName] = info;
    this.writeVersionInfo(allInfo);
  }

  public updateLastCheckTime(): void {
    const allInfo = this.readVersionInfo();
    const info = this.getVersionInfo();
    info.lastUpdateCheck = Date.now();
    allInfo[this.packageName] = info;
    this.writeVersionInfo(allInfo);
  }

  public updateLastPublished(timestamp: number): void {
    const allInfo = this.readVersionInfo();
    const info = this.getVersionInfo();
    info.lastPublished = timestamp;
    allInfo[this.packageName] = info;
    this.writeVersionInfo(allInfo);
  }

  public updateVersion(version: string): void {
    const allInfo = this.readVersionInfo();
    const info = this.getVersionInfo();
    info.version = version;
    allInfo[this.packageName] = info;
    this.writeVersionInfo(allInfo);
  }

  public shouldCheckForUpdates(): boolean {
    const info = this.getVersionInfo();
    
    if (info.commandCount % 10 !== 0) {
      return false;
    }

    if (info.lastUpdateCheck === 0) {
      return true;
    }

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastCheck = Date.now() - info.lastUpdateCheck;
    
    return timeSinceLastCheck > oneWeek;
  }

  public async checkForUpdates(): Promise<{ hasUpdate: boolean; latestVersion?: string; publishedDate?: Date }> {
    try {
      const response = await fetch(`https://registry.npmjs.org/${this.packageName}/latest`);
      if (!response.ok) {
        return { hasUpdate: false };
      }

      const data = await response.json();
      const latestVersion = data.version;
      const publishedDate = data.time ? new Date(data.time[latestVersion]) : undefined;

      this.updateLastCheckTime();
      
      if (publishedDate) {
        this.updateLastPublished(publishedDate.getTime());
      }

      const hasUpdate = this.compareVersions(this.currentVersion, latestVersion) < 0;

      return {
        hasUpdate,
        latestVersion: hasUpdate ? latestVersion : undefined,
        publishedDate
      };
    } catch (error) {
      return { hasUpdate: false };
    }
  }

  private compareVersions(v1: string, v2: string): number {
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
}
