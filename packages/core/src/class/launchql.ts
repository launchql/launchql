import fs, { writeFileSync } from 'fs';
import path, { dirname, resolve } from 'path';
import * as glob from 'glob';
import { walkUp } from '../utils';
import { extDeps, getDeps } from '../deps';
import chalk from 'chalk';
import { parse } from 'parse-package-name';
import os from 'os';
import { Logger } from '@launchql/logger';
import { execSync } from 'child_process';

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


const logger = new Logger('launchql');

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

function sortObjectByKey<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))) as T;
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
  public cwd: string;
  public workspacePath?: string;
  public modulePath?: string;
  public config?: any;
  public allowedDirs: string[] = [];

  private _moduleMap?: ModuleMap;
  private _moduleInfo?: ExtensionInfo;

  constructor(cwd: string = process.cwd()) {
    this.resetCwd(cwd);
  }

  resetCwd(cwd: string) {
    this.cwd = cwd;
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
    // Create sqitch.conf file (minimal configuration)
    const sqitchConf = `[core]
\tengine = pg
`;
    writeFileSync(path.join(targetPath, 'sqitch.conf'), sqitchConf);
    
    // Create sqitch.plan file
    const plan = `%syntax-version=1.0.0\n%project=${modName}\n%uri=${modName}\n`;
    writeFileSync(path.join(targetPath, 'sqitch.plan'), plan);
    
    // Create deploy, revert, and verify directories
    const dirs = ['deploy', 'revert', 'verify'];
    dirs.forEach(dir => {
      const dirPath = path.join(targetPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
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

  // ──────────────── Packaging and npm ────────────────

  publishToDist(distFolder: string = 'dist'): void {
    this.ensureModule();

    const modPath = this.modulePath!; // use modulePath, not cwd
    const name = this.getModuleName();
    const controlFile = `${name}.control`;
    const fullDist = path.join(modPath, distFolder);

    if (fs.existsSync(fullDist)) {
      fs.rmSync(fullDist, { recursive: true, force: true });
    }

    fs.mkdirSync(fullDist, { recursive: true });

    const folders = ['deploy', 'revert', 'sql', 'verify'];
    const files = ['Makefile', 'package.json', 'sqitch.conf', 'sqitch.plan', controlFile];


    // Add README file regardless of casing
    const readmeFile = fs.readdirSync(modPath).find(f => /^readme\.md$/i.test(f));
    if (readmeFile) {
      files.push(readmeFile); // Include it in the list of files to copy
    }

    for (const folder of folders) {
      const src = path.join(modPath, folder);
      if (fs.existsSync(src)) {
        fs.cpSync(src, path.join(fullDist, folder), { recursive: true });
      }
    }

    for (const file of files) {
      const src = path.join(modPath, file);
      if (!fs.existsSync(src)) {
        throw new Error(`Missing required file: ${file}`);
      }
      fs.cpSync(src, path.join(fullDist, file));
    }
  }

  /**
    * Installs an extension npm package into the local skitch extensions directory,
    * and automatically adds it to the current module’s package.json dependencies.
    */


  async installModules(...pkgstrs: string[]): Promise<void> {
    this.ensureWorkspace();
    this.ensureModule();
  
    const originalDir = process.cwd();
    const skitchExtDir = path.join(this.workspacePath!, 'extensions');
    const pkgJsonPath = path.join(this.modulePath!, 'package.json');
  
    if (!fs.existsSync(pkgJsonPath)) {
      throw new Error(`No package.json found at module path: ${this.modulePath}`);
    }
  
    const pkgData = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    pkgData.dependencies = pkgData.dependencies || {};
  
    const newlyAdded: string[] = [];
  
    for (const pkgstr of pkgstrs) {
      const { name } = parse(pkgstr);
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lql-install-'));
  
      try {
        process.chdir(tempDir);
        execSync(`npm install ${pkgstr} --production --prefix ./extensions`, {
          stdio: 'inherit'
        });
  
        const matches = glob.sync('./extensions/**/sqitch.conf');
        const installs = matches.map((conf) => {
          const fullConf = resolve(conf);
          const extDir = dirname(fullConf);
          const relativeDir = extDir.split('node_modules/')[1];
          const dstDir = path.join(skitchExtDir, relativeDir);
          return { src: extDir, dst: dstDir, pkg: relativeDir };
        });
  
        for (const { src, dst, pkg } of installs) {
          if (fs.existsSync(dst)) {
            fs.rmSync(dst, { recursive: true, force: true });
          }
  
          fs.mkdirSync(path.dirname(dst), { recursive: true });
          execSync(`mv "${src}" "${dst}"`);
          logger.success(`✔ installed ${pkg}`);
  
          const pkgJsonFile = path.join(dst, 'package.json');
          if (!fs.existsSync(pkgJsonFile)) {
            throw new Error(`Missing package.json in installed extension: ${dst}`);
          }
  
          const { version } = JSON.parse(fs.readFileSync(pkgJsonFile, 'utf-8'));
          pkgData.dependencies[name] = `${version}`;
  
          const extensionName = getExtensionName(dst);
          newlyAdded.push(extensionName);
        }
  
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        process.chdir(originalDir);
      }
    }
  
    const { dependencies, devDependencies, ...rest } = pkgData;
    const finalPkgData: Record<string, any> = { ...rest };
  
    if (dependencies) {
      finalPkgData.dependencies = sortObjectByKey(dependencies);
    }
    if (devDependencies) {
      finalPkgData.devDependencies = sortObjectByKey(devDependencies);
    }
  
    fs.writeFileSync(pkgJsonPath, JSON.stringify(finalPkgData, null, 2));
    logger.success(`📦 Updated package.json with: ${pkgstrs.join(', ')}`);
  
    // ─── Update .control file with actual extension names ──────────────
    const currentDeps = this.getRequiredModules();
    const updatedDeps = Array.from(new Set([...currentDeps, ...newlyAdded])).sort();
    writeExtensions(this.modulePath!, updatedDeps);
  }

}