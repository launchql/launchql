import fs from 'fs';
import path from 'path';
import { walkUp } from '../utils';
import { Logger } from '@launchql/logger';

export interface LaunchQLConfig {
  version?: string;
  directories?: string[];
  [key: string]: any;
}

export class ConfigManager {
  private logger = new Logger('launchql:config');
  private config?: LaunchQLConfig;
  private workspacePath?: string;
  private modulePath?: string;
  private allowedDirs: string[] = [];
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
    this.initialize();
  }

  private initialize(): void {
    this.workspacePath = this.resolveLaunchqlPath();
    this.modulePath = this.resolveSqitchPath();

    if (this.workspacePath) {
      this.config = this.loadConfig();
      this.allowedDirs = this.loadAllowedDirs();
    }
  }

  resetCwd(cwd: string): void {
    this.cwd = cwd;
    this.initialize();
  }

  private resolveLaunchqlPath(): string | undefined {
    try {
      return walkUp(this.cwd, 'launchql.json');
    } catch {
      return undefined;
    }
  }

  private resolveSqitchPath(): string | undefined {
    try {
      return walkUp(this.cwd, 'sqitch.conf');
    } catch {
      return undefined;
    }
  }

  private loadConfig(): LaunchQLConfig {
    if (!this.workspacePath) {
      throw new Error('Workspace path not found');
    }
    const configPath = path.join(this.workspacePath, 'launchql.json');
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  }

  private loadAllowedDirs(): string[] {
    if (!this.config?.directories) return [];
    
    return this.config.directories.map(dir => 
      path.resolve(this.workspacePath!, dir)
    );
  }

  isInsideAllowedDirs(cwd: string): boolean {
    return this.allowedDirs.some(dir => cwd.startsWith(dir));
  }

  getWorkspacePath(): string | undefined {
    return this.workspacePath;
  }

  getModulePath(): string | undefined {
    return this.modulePath;
  }

  getConfig(): LaunchQLConfig | undefined {
    return this.config;
  }

  get<T = any>(key: string): T | undefined {
    return this.config?.[key] as T;
  }

  getAllowedDirs(): string[] {
    return [...this.allowedDirs];
  }

  getCwd(): string {
    return this.cwd;
  }

  isInWorkspace(): boolean {
    return !!this.workspacePath;
  }

  isInModule(): boolean {
    return (
      !!this.modulePath &&
      !!this.workspacePath &&
      this.modulePath.startsWith(this.workspacePath)
    );
  }

  ensureWorkspace(): void {
    if (!this.workspacePath) {
      throw new Error('Not inside a workspace');
    }
  }

  ensureModule(): void {
    if (!this.modulePath) {
      throw new Error('Not inside a module');
    }
  }
}