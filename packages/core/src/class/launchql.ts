import fs, { writeFileSync } from 'fs';
import path from 'path';
import * as glob from 'glob';
import { walkUp } from '../utils';
import { extDeps, getDeps } from '../deps';
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
import { execSync } from 'child_process';

function getUTCTimestamp(d: Date = new Date()): string {
  return (
    d.getUTCFullYear() +
    '-' + String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(d.getUTCDate()).padStart(2, '0') +
    'T' + String(d.getUTCHours()).padStart(2, '0') +
    ':' + String(d.getUTCMinutes()).padStart(2, '0') +
    ':' + String(d.getUTCSeconds()).padStart(2, '0') +
    'Z'
  );
}

const getNow = () =>
process.env.NODE_ENV === 'test'
  ? getUTCTimestamp(new Date('2017-08-11T08:11:51Z'))
  : getUTCTimestamp(new Date());


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

  getModuleExtensions(): { resolved: string[]; external: string[] } {
    this.ensureModule();
    const moduleName = this.getModuleName();
    const moduleMap = this.getModuleMap();
    return extDeps(moduleName, moduleMap);
  }

  getModuleDependencies(moduleName: string): { native: string[]; modules: string[] } {
    const modules = this.getModuleMap();
    const { native, sqitch } = getExtensionsAndModules(moduleName, modules);
    return { native, modules: sqitch };
  }

  getModuleDependencyChanges(moduleName: string): {
    native: string[];
    modules: { name: string; latest: string; version: string }[];
  } {
    const modules = this.getModuleMap();
    const { native, sqitch } = getExtensionsAndModulesChanges(moduleName, modules, this.workspacePath!);
    return { native, modules: sqitch };
  }

  // ──────────────── Plans ────────────────

  getModulePlan(): string {
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

  generateModulePlan(options: { uri?: string; projects?: boolean }): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    const moduleName = info.extname;

    const now = getNow();

    const planfile: string[] = [
      `%syntax-version=1.0.0`,
      `%project=${moduleName}`,
      `%uri=${options.uri || moduleName}`
    ];

    // Get raw dependencies and resolved list
    let { resolved, deps } = getDeps(this.cwd, moduleName);
    
    // Helper to extract module name from a change reference
    const getModuleName = (change: string): string | null => {
      const colonIndex = change.indexOf(':');
      return colonIndex > 0 ? change.substring(0, colonIndex) : null;
    };
    
    // Helper to determine if a change is truly from an external project
    const isExternalChange = (change: string): boolean => {
      const changeModule = getModuleName(change);
      return changeModule !== null && changeModule !== moduleName;
    };
    
    // Helper to normalize change name (remove project prefix)
    const normalizeChangeName = (change: string): string => {
      return change.includes(':') ? change.split(':').pop() : change;
    };
    
    // Clean up the resolved list to handle both formats
    const uniqueChangeNames = new Set<string>();
    const normalizedResolved: any[] = [];
    
    // First, add local changes without prefixes
    resolved.forEach(change => {
      const normalized = normalizeChangeName(change);
      
      // Skip if we've already added this change
      if (uniqueChangeNames.has(normalized)) return;
      
      // Skip truly external changes - they should only be in dependencies
      if (isExternalChange(change)) return;
      
      uniqueChangeNames.add(normalized);
      normalizedResolved.push(normalized);
    });
    
    // Clean up the deps object
    const normalizedDeps: any = {};
    
    // Process each deps entry
    Object.keys(deps).forEach(key => {
      // Normalize the key - strip "/deploy/" and ".sql" if present
      let normalizedKey = key;
      if (normalizedKey.startsWith('/deploy/')) {
        normalizedKey = normalizedKey.substring(8); // Remove "/deploy/"
      }
      if (normalizedKey.endsWith('.sql')) {
        normalizedKey = normalizedKey.substring(0, normalizedKey.length - 4); // Remove ".sql"
      }
      
      // Skip keys for truly external changes - we only want local changes as keys
      if (isExternalChange(normalizedKey)) return;
      
      // Normalize the key for all changes, removing any same-project prefix
      const cleanKey = normalizeChangeName(normalizedKey);
      
      // Build the standard key format for our normalized deps
      const standardKey = `/deploy/${cleanKey}.sql`;
      
      // Initialize the dependencies array for this key if it doesn't exist
      normalizedDeps[standardKey] = normalizedDeps[standardKey] || [];
      
      // Add dependencies, handling both formats
      const dependencies = deps[key] || [];
      dependencies.forEach(dep => {
        // For truly external dependencies, keep the full reference
        if (isExternalChange(dep)) {
          if (!normalizedDeps[standardKey].includes(dep)) {
            normalizedDeps[standardKey].push(dep);
          }
        } else {
          // For same-project dependencies, normalize by removing prefix
          const normalizedDep = normalizeChangeName(dep);
          if (!normalizedDeps[standardKey].includes(normalizedDep)) {
            normalizedDeps[standardKey].push(normalizedDep);
          }
        }
      });
    });
    
    // Update with normalized versions
    resolved = normalizedResolved;
    deps = normalizedDeps;
    
    // Process external dependencies if needed
    if (options.projects && this.workspacePath) {
      const depData = this.getModuleDependencyChanges(moduleName);
      const external = depData.modules.map((m) => `${m.name}:${m.latest}`);
      
      // Add external dependencies to the first change if there is one
      if (resolved.length > 0) {
        const firstKey = `/deploy/${resolved[0]}.sql`;
        deps[firstKey] = deps[firstKey] || [];
        
        // Only add external deps that don't already exist
        external.forEach(ext => {
          if (!deps[firstKey].includes(ext)) {
            deps[firstKey].push(ext);
          }
        });
      }
    }

    // For debugging - log the cleaned structures
    // console.log("CLEAN DEPS GRAPH", JSON.stringify(deps, null, 2));
    // console.log("CLEAN RES GRAPH", JSON.stringify(resolved, null, 2));
    
    // Generate the plan with the cleaned structures
    resolved.forEach(res => {
      const key = `/deploy/${res}.sql`;
      const dependencies = deps[key] || [];
      
      // Filter out dependencies that match the current change name
      // This prevents listing a change as dependent on itself
      const filteredDeps = dependencies.filter(dep => 
        normalizeChangeName(dep) !== res
      );
      
      if (filteredDeps.length > 0) {
        planfile.push(
          `${res} [${filteredDeps.join(' ')}] ${now} launchql <launchql@5b0c196eeb62> # add ${res}`
        );
      } else {
        planfile.push(
          `${res} ${now} launchql <launchql@5b0c196eeb62> # add ${res}`
        );
      }
    });

    return planfile.join('\n');
}
  
  writeModulePlan(
    options: { uri?: string; projects?: boolean }
  ): void {
    this.ensureModule();
    const name = this.getModuleName();
    const plan = this.generateModulePlan(options);
    const moduleMap = this.getModuleMap();
    const mod = moduleMap[name];
    const planPath = path.join(this.workspacePath!, mod.path, 'sqitch.plan');
    writeFileSync(planPath, plan);
  }

}