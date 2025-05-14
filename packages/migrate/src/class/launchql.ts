import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import { walkUp } from '../utils';

import {
  listModules,
  latestChange,
  latestChangeAndVersion,
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  ModuleMap
} from '../modules';

import {
  getExtensionInfo,
  writeExtensions,
  getExtensionName,
  getAvailableExtensions,
  getInstalledExtensions,
  ExtensionInfo,
} from '../extensions';

export enum ProjectContext {
  Outside = 'outside',
  Workspace = 'workspace-root',
  Module = 'module',
  ModuleInsideWorkspace = 'module-in-workspace',
}

export class LaunchQLProject {
  public readonly cwd: string;
  public workspacePath?: string;
  public modulePath?: string;
  public config?: any;
  public allowedDirs: string[] = [];

  private _moduleMap?: ModuleMap;
  private _moduleInfo?: ExtensionInfo;

  constructor(cwd: string = process.cwd()) {
    this.cwd = path.resolve(cwd);
  }

  async init(): Promise<void> {
    this.workspacePath = await this.resolveLaunchqlPath();
    this.modulePath = await this.resolveSqitchPath();

    if (this.workspacePath) {
      this.config = this.loadConfig();
      this.allowedDirs = this.loadAllowedDirs();
    }
  }

  private async resolveLaunchqlPath(): Promise<string | undefined> {
    try {
      return await walkUp(this.cwd, 'launchql.json');
    } catch {
      return undefined;
    }
  }

  private async resolveSqitchPath(): Promise<string | undefined> {
    try {
      return await walkUp(this.cwd, 'sqitch.conf');
    } catch {
      return undefined;
    }
  }

  private loadConfig(): any {
    const configPath = path.join(this.workspacePath!, 'launchql.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  private loadAllowedDirs(): string[] {
    const globs: string[] = this.config?.packages ?? [];
    const dirs = globs.flatMap(pattern =>
      glob.sync(path.join(this.workspacePath!, pattern))
    );
    return dirs.map(dir => path.resolve(dir));
  }

  private ensureModule(): void {
    if (!this.modulePath) throw new Error('Not inside a module');
  }

  getContext(): ProjectContext {
    if (this.modulePath && this.workspacePath) {
      const rel = path.relative(this.workspacePath, this.modulePath);
      const nested = !rel.startsWith('..') && !path.isAbsolute(rel);
      return nested ? ProjectContext.ModuleInsideWorkspace : ProjectContext.Module;
    }

    if (this.modulePath) return ProjectContext.Module;
    if (this.workspacePath) return ProjectContext.Workspace;
    return ProjectContext.Outside;
  }

  isInWorkspace(): boolean {
    return this.getContext() === ProjectContext.Workspace;
  }

  isInModule(): boolean {
    return (
      this.getContext() === ProjectContext.Module ||
      this.getContext() === ProjectContext.ModuleInsideWorkspace
    );
  }

  isInAllowedDir(): boolean {
    return this.allowedDirs.some(dir => this.cwd.startsWith(dir));
  }

  getWorkspacePath(): string | undefined {
    return this.workspacePath;
  }

  getModulePath(): string | undefined {
    return this.modulePath;
  }

  clearCache() {
    delete this._moduleInfo;
    delete this._moduleMap;
  }

  // ──────────────── Workspace-wide ────────────────

  async getModules(): Promise<LaunchQLProject[]> {
    if (!this.workspacePath || !this.config) return [];

    const dirs = this.loadAllowedDirs();
    const results: LaunchQLProject[] = [];

    for (const dir of dirs) {
      const proj = new LaunchQLProject(dir);
      await proj.init();
      if (proj.isInModule()) {
        results.push(proj);
      }
    }

    return results;
  }

  getModuleMap(): ModuleMap {
    if (!this.workspacePath) return {};
    if (this._moduleMap) return this._moduleMap;

    this._moduleMap = listModules(this.workspacePath);
    return this._moduleMap;
  }

  getAvailableModules(): string[] {
    const modules = this.getModuleMap();
    return getAvailableExtensions(modules);
  }

  // ──────────────── Module-scoped ────────────────

  getModuleInfo(): ExtensionInfo {
    this.ensureModule();
    if (!this._moduleInfo) {
      this._moduleInfo = getExtensionInfo(this.cwd);
    }
    return this._moduleInfo;
  }

  getModuleName(): string {
    this.ensureModule();
    return getExtensionName(this.cwd);
  }

  getRequiredModules(): string[] {
    this.ensureModule();
    const info = this.getModuleInfo();
    return getInstalledExtensions(info.controlFile);
  }

  setModuleDependencies(modules: string[]): void {
    this.ensureModule();
    writeExtensions(this.cwd, modules);
  }

  // ──────────────── Dependency Analysis ────────────────

  getLatestChange(moduleName: string): string {
    const modules = this.getModuleMap();
    return latestChange(moduleName, modules, this.workspacePath!);
  }

  getLatestChangeAndVersion(moduleName: string): { change: string; version: string } {
    const modules = this.getModuleMap();
    return latestChangeAndVersion(moduleName, modules, this.workspacePath!);
  }

  getModuleDependencies(moduleName: string): { native: string[]; modules: string[] } {
    const modules = this.getModuleMap();
    const { native, sqitch } = getExtensionsAndModules(moduleName, modules);
    return { native, modules: sqitch };
  }

  async getModuleDependencyChanges(moduleName: string): Promise<{
    native: string[];
    modules: { name: string; latest: string; version: string }[];
  }> {
    const modules = this.getModuleMap();
    const { native, sqitch } = await getExtensionsAndModulesChanges(moduleName, modules, this.workspacePath!);
    return { native, modules: sqitch };
  }
}
