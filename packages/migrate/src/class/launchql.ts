import fs, { writeFileSync } from 'fs';
import path from 'path';
import * as glob from 'glob';
import { walkUp } from '../utils';
import { getDeps } from '../deps';
import chalk from 'chalk';

import {
  writeRenderedTemplates,
  moduleTemplate
} from '@launchql/templatizer';

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
import { exec, execSync } from 'child_process';

export enum ProjectContext {
  Outside = 'outside',
  Workspace = 'workspace-root',
  Module = 'module',
  ModuleInsideWorkspace = 'module-in-workspace',
}

export interface InitModuleOptions {
  name: string;
  description: string;
  author: string;
  extensions: string[];
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
    this.workspacePath = this.resolveLaunchqlPath();
    this.modulePath = this.resolveSqitchPath();

    if (this.workspacePath) {
      this.config = this.loadConfig();
      this.allowedDirs = this.loadAllowedDirs();
    }
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

  isInsideAllowedDirs(cwd: string): boolean {
    return this.allowedDirs.some(dir => cwd.startsWith(dir));
  }

  private createModuleDirectory(modName: string): string {
    this.ensureWorkspace();

    const isRoot = path.resolve(this.workspacePath!) === path.resolve(this.cwd);
    let targetPath: string;

    if (isRoot) {
      const packagesDir = path.join(this.cwd, 'packages');
      fs.mkdirSync(packagesDir, { recursive: true });
      targetPath = path.join(packagesDir, modName);
    } else {

      if (!this.isInsideAllowedDirs(this.cwd)) {
        console.error(chalk.red(`Error: You must be inside one of the workspace packages: ${this.allowedDirs.join(', ')}`));
        process.exit(1);
      }

      targetPath = path.join(this.cwd, modName);
    }

    fs.mkdirSync(targetPath, { recursive: true });
    return targetPath;
  }

  ensureModule(): void {
    if (!this.modulePath) throw new Error('Not inside a module');
  }  

  ensureWorkspace(): void {
    if (!this.workspacePath) throw new Error('Not inside a workspace');
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

  private initModuleSqitch(modName: string, targetPath: string): void {
    const cur = process.cwd();
    process.chdir(targetPath);
    execSync(`sqitch init ${modName} --engine pg`, { stdio: 'inherit' });
    const plan = `%syntax-version=1.0.0\n%project=${modName}\n%uri=${modName}`;
    writeFileSync(path.join(targetPath, 'sqitch.plan'), plan);
    process.chdir(cur);
  }

  initModule(options: InitModuleOptions): void {
    this.ensureWorkspace();
    const targetPath = this.createModuleDirectory(options.name);
    writeRenderedTemplates(moduleTemplate, targetPath, options);  
    this.initModuleSqitch(options.name, targetPath);
    writeExtensions(targetPath, options.extensions);
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

  // ──────────────── Plans ────────────────

  getModulePlan (): string {
    this.ensureModule();
    const planPath = path.join(this.getModulePath()!, 'sqitch.plan');
    return fs.readFileSync(planPath, 'utf8');
  }

  getModuleControlFile(): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    return fs.readFileSync(info.controlFile, 'utf8');
  }

  getModuleMakefile(): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    return fs.readFileSync(info.Makefile, 'utf8');
  }

  getModuleSQL(): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    return fs.readFileSync(info.sqlFile, 'utf8');
  }

  async generateModulePlan(options: { uri?: string; projects?: boolean }): Promise<string> {
    this.ensureModule();
    const info = this.getModuleInfo();
    const moduleName = info.extname;

    const now =
      process.env.NODE_ENV === 'test'
        ? '2017-08-11T08:11:51Z'
        : new Date().toISOString();

    const planfile: string[] = [
      `%syntax-version=1.0.0`,
      `%project=${moduleName}`,
      `%uri=${options.uri || moduleName}`
    ];

    const { resolved, deps } = await getDeps(this.cwd, moduleName);

    if (options.projects && this.workspacePath) {
      const depData = await this.getModuleDependencyChanges(moduleName);
      const external = depData.modules.map((m) => `${m.name}:${m.latest}`);

      const key = `/deploy/${resolved[0]}.sql`;
      deps[key] ||= [];
      deps[key].push(...external);
    }

    const makeKey = (sqlmod: string) => `/deploy/${sqlmod}.sql`;

    resolved.forEach((res) => {
      if (/:/.test(res)) return;

      const dependencies = deps[makeKey(res)];
      if (dependencies?.length) {
        planfile.push(
          `${res} [${dependencies.join(
            ' '
          )}] ${now} launchql <launchql@5b0c196eeb62> # add ${res}`
        );
      } else {
        planfile.push(`${res} ${now} launchql <launchql@5b0c196eeb62> # add ${res}`);
      }
    });

    return planfile.join('\n');
  }

  async writeModulePlan(
    options: { uri?: string; projects?: boolean }
  ): Promise<void> {
    this.ensureModule();
    const name = this.getModuleName();
    const plan = await this.generateModulePlan(options);
    const moduleMap = this.getModuleMap();
    const mod = moduleMap[name];
    const planPath = path.join(this.workspacePath!, mod.path, 'sqitch.plan');
    writeFileSync(planPath, plan);
  }

}
