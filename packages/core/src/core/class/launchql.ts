import { loadConfigSyncFromDir, resolveLaunchqlPath,walkUp } from '@launchql/env';
import { Logger } from '@launchql/logger';
import {
  moduleTemplate,
  writeRenderedTemplates} from '@launchql/templatizer';
import { errors, LaunchQLOptions, LaunchQLWorkspaceConfig } from '@launchql/types';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import * as glob from 'glob';
import os from 'os';
import { parse } from 'parse-package-name';
import path, { dirname, resolve } from 'path';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

import { getAvailableExtensions } from '../../extensions/extensions';
import { generatePlan, writePlan, writePlanFile } from '../../files';
import { Tag, ExtendedPlanFile, Change } from '../../files/types';
import { parsePlanFile } from '../../files/plan/parser';
import { isValidTagName } from '../../files/plan/validators';
import { getNow as getPlanTimestamp } from '../../files/plan/generator';
import { resolveTagToChangeName } from '../../resolution/resolve';
import {
  ExtensionInfo,
  getExtensionInfo,
  getExtensionName,
  getInstalledExtensions,
  parseControlFile,
  writeExtensions,
} from '../../files';
import { generateControlFileContent, writeExtensionMakefile } from '../../files/extension/writer';
import { LaunchQLMigrate } from '../../migrate/client';
import {
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  latestChange,
  latestChangeAndVersion,
  ModuleMap
} from '../../modules/modules';
import { packageModule } from '../../packaging/package';
import { resolveExtensionDependencies, resolveDependencies } from '../../resolution/deps';
import { PackageAnalysisIssue, PackageAnalysisResult, RenameOptions } from '../../files/types';

import { parseTarget } from '../../utils/target-utils';


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


/**
 * Truncates workspace extensions to include only modules from the target onwards.
 * This prevents processing unnecessary modules that come before the target in dependency order.
 * 
 * @param workspaceExtensions - The full workspace extension dependencies
 * @param targetName - The target module name to truncate from
 * @returns Truncated extensions starting from the target module
 */
const truncateExtensionsToTarget = (
  workspaceExtensions: { resolved: string[]; external: string[] },
  targetName: string
): { resolved: string[]; external: string[] } => {
  const targetIndex = workspaceExtensions.resolved.indexOf(targetName);

  if (targetIndex === -1) {
    return workspaceExtensions;
  }

  return {
    resolved: workspaceExtensions.resolved.slice(targetIndex),
    external: workspaceExtensions.external
  };
}

export enum PackageContext {
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

export class LaunchQLPackage {
  public cwd: string;
  public workspacePath?: string;
  public modulePath?: string;
  public config?: LaunchQLWorkspaceConfig;
  public allowedDirs: string[] = [];

  private _moduleMap?: ModuleMap;
  private _moduleInfo?: ExtensionInfo;

  constructor(cwd: string = process.cwd()) {
    this.resetCwd(cwd);
  }

  resetCwd(cwd: string) {
    this.cwd = cwd;
    this.workspacePath = resolveLaunchqlPath(this.cwd);
    this.modulePath = this.resolveSqitchPath();

    if (this.workspacePath) {
      this.config = this.loadConfigSync();
      this.allowedDirs = this.loadAllowedDirs();
    }
  }

  private resolveSqitchPath(): string | undefined {
    try {
      return walkUp(this.cwd, 'launchql.plan');
    } catch {
      return undefined;
    }
  }

  private loadConfigSync(): LaunchQLWorkspaceConfig {
    return loadConfigSyncFromDir(this.workspacePath!) as LaunchQLWorkspaceConfig;
  }

  private loadAllowedDirs(): string[] {
    const globs: string[] = this.config?.packages ?? [];
    const dirs = globs.flatMap(pattern =>
      glob.sync(path.join(this.workspacePath!, pattern))
    );
    const resolvedDirs = dirs.map(dir => path.resolve(dir));
    // Remove duplicates by converting to Set and back to array
    return [...new Set(resolvedDirs)];
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

  getContext(): PackageContext {
    if (this.modulePath && this.workspacePath) {
      const rel = path.relative(this.workspacePath, this.modulePath);
      const nested = !rel.startsWith('..') && !path.isAbsolute(rel);
      return nested ? PackageContext.ModuleInsideWorkspace : PackageContext.Module;
    }

    if (this.modulePath) return PackageContext.Module;
    if (this.workspacePath) return PackageContext.Workspace;
    return PackageContext.Outside;
  }

  isInWorkspace(): boolean {
    return this.getContext() === PackageContext.Workspace;
  }

  isInModule(): boolean {
    return (
      this.getContext() === PackageContext.Module ||
      this.getContext() === PackageContext.ModuleInsideWorkspace
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

  async getModules(): Promise<LaunchQLPackage[]> {
    if (!this.workspacePath || !this.config) return [];

    const dirs = this.loadAllowedDirs();
    const results: LaunchQLPackage[] = [];

    for (const dir of dirs) {
      const proj = new LaunchQLPackage(dir);
      if (proj.isInModule()) {
        results.push(proj);
      }
    }

    return results;
  }

  /**
   * List all modules by parsing .control files in the workspace directory.
   * Handles naming collisions by preferring the shortest path.
   */
  listModules(): ModuleMap {
    if (!this.workspacePath) return {};

    const moduleFiles = glob.sync(`${this.workspacePath}/**/*.control`).filter(
      (file: string) => !/node_modules/.test(file)
    );

    // Group files by module name to handle collisions
    const filesByName = new Map<string, string[]>();
    
    moduleFiles.forEach((file: string) => {
      const moduleName = path.basename(file).split('.control')[0];
      if (!filesByName.has(moduleName)) {
        filesByName.set(moduleName, []);
      }
      filesByName.get(moduleName)!.push(file);
    });

    // For each module name, pick the shortest path in case of collisions
    const selectedFiles = new Map<string, string>();
    filesByName.forEach((files, moduleName) => {
      if (files.length === 1) {
        selectedFiles.set(moduleName, files[0]);
      } else {
        // Multiple files with same name - pick shortest path
        const shortestFile = files.reduce((shortest, current) => 
          current.length < shortest.length ? current : shortest
        );
        selectedFiles.set(moduleName, shortestFile);
      }
    });

    // Parse the selected control files
    return Array.from(selectedFiles.entries()).reduce<ModuleMap>((acc: ModuleMap, [moduleName, file]) => {
      const module = parseControlFile(file, this.workspacePath!);
      acc[moduleName] = module;
      return acc;
    }, {});
  }

  getModuleMap(): ModuleMap {
    if (!this.workspacePath) return {};
    if (this._moduleMap) return this._moduleMap;

    this._moduleMap = this.listModules();
    return this._moduleMap;
  }

  getAvailableModules(): string[] {
    const modules = this.getModuleMap();
    return getAvailableExtensions(modules);
  }

  getModuleProject(name: string): LaunchQLPackage {
    this.ensureWorkspace();
    
    if (this.isInModule() && name === this.getModuleName()) {
      return this;
    }
    
    const modules = this.getModuleMap();
    if (!modules[name]) {
      throw errors.MODULE_NOT_FOUND({ name });
    }
    
    const modulePath = path.resolve(this.workspacePath!, modules[name].path);
    return new LaunchQLPackage(modulePath);
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
    
    // Validate for circular dependencies
    this.validateModuleDependencies(modules);
    
    writeExtensions(this.cwd, modules);
  }

  private validateModuleDependencies(modules: string[]): void {
    const currentModuleName = this.getModuleName();
    
    if (modules.includes(currentModuleName)) {
      throw errors.CIRCULAR_DEPENDENCY({ module: currentModuleName, dependency: currentModuleName });
    }
    
    // Check for circular dependencies by examining each module's dependencies
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const checkCircular = (moduleName: string, path: string[] = []): void => {
      if (visiting.has(moduleName)) {
        throw errors.CIRCULAR_DEPENDENCY({ module: path.join(' -> '), dependency: moduleName });
      }
      if (visited.has(moduleName)) {
        return;
      }
      
      visiting.add(moduleName);
      // More complex dependency resolution would require loading other modules' dependencies
      visiting.delete(moduleName);
      visited.add(moduleName);
    };
    
    modules.forEach(module => checkCircular(module, [currentModuleName]));
  }

  private initModuleSqitch(modName: string, targetPath: string): void {
    // Create launchql.plan file using package-files package
    const plan = generatePlan({
      moduleName: modName,
      uri: modName,
      entries: []
    });
    writePlan(path.join(targetPath, 'launchql.plan'), plan);
    
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
    return resolveExtensionDependencies(moduleName, moduleMap);
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
    const planPath = path.join(this.getModulePath()!, 'launchql.plan');
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

  generateModulePlan(options: { uri?: string; includePackages?: boolean; includeTags?: boolean }): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    const moduleName = info.extname;

    // Get raw dependencies and resolved list
    const tagResolution = options.includeTags === true ? 'preserve' : 'internal';
    let { resolved, deps } = resolveDependencies(this.cwd, moduleName, { tagResolution });

    // Helper to extract module name from a change reference
    const getModuleName = (change: string): string | null => {
      const colonIndex = change.indexOf(':');
      return colonIndex > 0 ? change.substring(0, colonIndex) : null;
    };

    // Helper to determine if a change is truly from an external package
    const isExternalChange = (change: string): boolean => {
      const changeModule = getModuleName(change);
      return changeModule !== null && changeModule !== moduleName;
    };

    // Helper to normalize change name (remove package prefix)
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

      // Normalize the key for all changes, removing any same-package prefix
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
          // For same-package dependencies, normalize by removing prefix
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
    const includePackages = options.includePackages === true;
    const preferTags = options.includeTags === true;
    if (includePackages && this.workspacePath) {
      const depData = this.getModuleDependencyChanges(moduleName);

      if (resolved.length > 0) {
        const firstKey = `/deploy/${resolved[0]}.sql`;
        deps[firstKey] = deps[firstKey] || [];

        depData.modules.forEach(m => {
          const extModuleName = m.name;

          const hasTagDependency = deps[firstKey].some(dep =>
            dep.startsWith(`${extModuleName}:@`)
          );

          let depToken = `${extModuleName}:${m.latest}`;

          if (preferTags) {
            try {
              const moduleMap = this.getModuleMap();
              const modInfo = moduleMap[extModuleName];
              if (modInfo && this.workspacePath) {
                const planPath = path.join(this.workspacePath, modInfo.path, 'launchql.plan');
                const parsed = parsePlanFile(planPath);
                const changes = parsed.data?.changes || [];
                const tags = parsed.data?.tags || [];

                if (changes.length > 0 && tags.length > 0) {
                  const lastChangeName = changes[changes.length - 1]?.name;
                  const lastTag = tags[tags.length - 1];
                  if (lastTag && lastTag.change === lastChangeName) {
                    depToken = `${extModuleName}:@${lastTag.name}`;
                  }
                }
              }
            } catch {}
          }

          if (!hasTagDependency && !deps[firstKey].includes(depToken)) {
            deps[firstKey].push(depToken);
          }
        });
      }
    }

    // For debugging - log the cleaned structures
    // console.log("CLEAN DEPS GRAPH", JSON.stringify(deps, null, 2));
    // console.log("CLEAN RES GRAPH", JSON.stringify(resolved, null, 2));

    // Prepare entries for the plan file
    const entries = resolved.map(res => {
      const key = `/deploy/${res}.sql`;
      const dependencies = deps[key] || [];

      // Filter out dependencies that match the current change name
      // This prevents listing a change as dependent on itself
      const filteredDeps = dependencies.filter(dep =>
        normalizeChangeName(dep) !== res
      );

      return {
        change: res,
        dependencies: filteredDeps,
        comment: `add ${res}`
      };
    });

    // Use the package-files package to generate the plan
    return generatePlan({
      moduleName,
      uri: options.uri,
      entries
    });
  }

  writeModulePlan(
    options: { uri?: string; includePackages?: boolean; includeTags?: boolean }
  ): void {
    this.ensureModule();
    const name = this.getModuleName();
    const plan = this.generateModulePlan(options);
    const moduleMap = this.getModuleMap();
    const mod = moduleMap[name];
    const planPath = path.join(this.workspacePath!, mod.path, 'launchql.plan');
    
    // Use the package-files package to write the plan
    writePlan(planPath, plan);
  }

  /**
   * Add a tag to the current module's plan file
   */
  addTag(tagName: string, changeName?: string, comment?: string): void {
    this.ensureModule();
    
    if (!this.modulePath) {
      throw errors.PATH_NOT_FOUND({ path: 'module path', type: 'module' });
    }
    
    // Validate tag name
    if (!isValidTagName(tagName)) {
      throw errors.INVALID_NAME({ name: tagName, type: 'tag', rules: "Tag names must follow Sqitch naming rules and cannot contain '/'" });
    }
    
    const planPath = path.join(this.modulePath, 'launchql.plan');
    
    // Parse existing plan file
    const planResult = parsePlanFile(planPath);
    if (!planResult.data) {
      throw errors.PLAN_PARSE_ERROR({ planPath, errors: planResult.errors.map(e => e.message).join(', ') });
    }
    
    const plan = planResult.data;
    
    let targetChange = changeName;
    if (!targetChange) {
      if (plan.changes.length === 0) {
        throw new Error('No changes found in plan file. Cannot add tag without a target change.');
      }
      targetChange = plan.changes[plan.changes.length - 1].name;
    } else {
      // Validate that the specified change exists
      const changeExists = plan.changes.some(c => c.name === targetChange);
      if (!changeExists) {
        throw errors.CHANGE_NOT_FOUND({ change: targetChange });
      }
    }
    
    // Check if tag already exists
    const existingTag = plan.tags.find(t => t.name === tagName);
    if (existingTag) {
      throw new Error(`Tag '${tagName}' already exists and points to change '${existingTag.change}'.`);
    }
    
    // Create new tag
    const newTag: Tag = {
      name: tagName,
      change: targetChange,
      timestamp: getPlanTimestamp(),
      planner: 'launchql',
      email: 'launchql@5b0c196eeb62',
      comment
    };
    
    plan.tags.push(newTag);
    
    // Write updated plan file
    writePlanFile(planPath, plan);
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
    const files = ['Makefile', 'package.json', 'launchql.plan', controlFile];


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
  
        const matches = glob.sync('./extensions/**/launchql.plan');
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

  // ──────────────── Package Operations ────────────────

  public resolveWorkspaceExtensionDependencies(): { resolved: string[]; external: string[] } {
    const modules = this.getModuleMap();
    const allModuleNames = Object.keys(modules);
    
    if (allModuleNames.length === 0) {
      return { resolved: [], external: [] };
    }
    
    // Create a virtual module that depends on all workspace modules
    const virtualModuleName = '_virtual/workspace';
    const virtualModuleMap = {
      ...modules,
      [virtualModuleName]: {
        requires: allModuleNames
      }
    };
    
    const { resolved, external } = resolveExtensionDependencies(virtualModuleName, virtualModuleMap);
    
    // Filter out the virtual module and return the result
    return {
      resolved: resolved.filter((moduleName: string) => moduleName !== virtualModuleName),
      external: external
    };
  }

  private parsePackageTarget(target?: string): { name: string | null; toChange: string | undefined } {
    let name: string | null;
    let toChange: string | undefined;

    if (!target) {
      const context = this.getContext();
      if (context === PackageContext.Module || context === PackageContext.ModuleInsideWorkspace) {
        name = this.getModuleName();
      } else if (context === PackageContext.Workspace) {
        const modules = this.getModuleMap();
        const moduleNames = Object.keys(modules);
        if (moduleNames.length === 0) {
          throw new Error('No modules found in workspace');
        }
        name = null; // Indicates workspace-wide operation
      } else {
        throw new Error('Not in a LaunchQL workspace or module');
      }
    } else {
      const parsed = parseTarget(target);
      name = parsed.packageName;
      toChange = parsed.toChange;
    }

    return { name, toChange };
  }

  async deploy(
    opts: LaunchQLOptions,
    target?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('deploy');

    const { name, toChange } = this.parsePackageTarget(target);

    if (recursive) {
      // Cache for fast deployment
      const deployFastCache: Record<string, Awaited<ReturnType<typeof packageModule>>> = {};

      const getCacheKey = (
        pg: PgConfig,
        name: string,
        database: string
      ): string => {
        const { host, port, user } = pg ?? {};
        return `${host}:${port}:${user}:${database}:${name}`;
      };

      const modules = this.getModuleMap();
      
      let extensions: { resolved: string[]; external: string[] };
      
      if (name === null) {
        // When name is null, deploy ALL modules in the workspace
        extensions = this.resolveWorkspaceExtensionDependencies();
      } else {
        const moduleProject = this.getModuleProject(name);
        extensions = moduleProject.getModuleExtensions();
      }

      const pgPool = getPgPool(opts.pg);

      const targetDescription = name === null ? 'all modules' : name;
      log.success(`🚀 Starting deployment to database ${opts.pg.database}...`);

      for (const extension of extensions.resolved) {
        try {
          if (extensions.external.includes(extension)) {
            const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
            log.info(`📥 Installing external extension: ${extension}`);
            await pgPool.query(msg);
          } else {
            const modulePath = resolve(this.workspacePath!, modules[extension].path);
            log.info(`📂 Deploying local module: ${extension}`);

            if (opts.deployment.fast) {
              const localProject = this.getModuleProject(extension);
              const cacheKey = getCacheKey(opts.pg as PgConfig, extension, opts.pg.database);
            
              if (opts.deployment.cache && deployFastCache[cacheKey]) {
                log.warn(`⚡ Using cached pkg for ${extension}.`);
                await pgPool.query(deployFastCache[cacheKey].sql);
                continue;
              }

              let pkg;
              try {
                pkg = await packageModule(localProject.modulePath, { 
                  usePlan: opts.deployment.usePlan, 
                  extension: false 
                });
              } catch (err: any) {
                const errorLines = [];
                errorLines.push(`❌ Failed to package module "${extension}" at path: ${modulePath}`);
                errorLines.push(`   Module Path: ${modulePath}`);
                errorLines.push(`   Workspace Path: ${this.workspacePath}`);
                errorLines.push(`   Error Code: ${err.code || 'N/A'}`);
                errorLines.push(`   Error Message: ${err.message || 'Unknown error'}`);
              
                if (err.code === 'ENOENT') {
                  errorLines.push('💡 Hint: File or directory not found. Check if the module path is correct.');
                } else if (err.code === 'EACCES') {
                  errorLines.push('💡 Hint: Permission denied. Check file permissions.');
                } else if (err.message && err.message.includes('launchql.plan')) {
                  errorLines.push('💡 Hint: launchql.plan file issue. Check if the plan file exists and is valid.');
                }
              
                log.error(errorLines.join('\n'));
                console.error(err);
                throw errors.DEPLOYMENT_FAILED({ 
                  type: 'Deployment', 
                  module: extension
                });
              }

              await pgPool.query(pkg.sql);

              if (opts.deployment.cache) {
                deployFastCache[cacheKey] = pkg;
              }
            } else {
              try {
                const client = new LaunchQLMigrate(opts.pg as PgConfig);
              
                // Only apply toChange to the target module, not its dependencies
                const moduleToChange = extension === name ? toChange : undefined;
                const result = await client.deploy({
                  modulePath,
                  toChange: moduleToChange,
                  useTransaction: opts.deployment.useTx,
                  logOnly: opts.deployment.logOnly,
                  usePlan: opts.deployment.usePlan
                });
              
                if (result.failed) {
                  throw errors.OPERATION_FAILED({ operation: 'Deployment', target: result.failed });
                }
              } catch (deployError) {
                log.error(`❌ Deployment failed for module ${extension}`);
                console.error(deployError);
                throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
              }
            }
          }
        } catch (err) {
          log.error(`🛑 Error during deployment: ${err instanceof Error ? err.message : err}`);
          console.error(err);
          throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
        }
      }

      log.success(`✅ Deployment complete for ${targetDescription}.`);
    } else {
      if (name === null) {
        throw errors.WORKSPACE_OPERATION_ERROR({ operation: 'deployment' });
      }
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw errors.PATH_NOT_FOUND({ path: name, type: 'module' });
      }

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.deploy({
        modulePath,
        toChange,
        useTransaction: opts.deployment?.useTx,
        logOnly: opts.deployment?.logOnly,
        usePlan: opts.deployment?.usePlan
      });

      if (result.failed) {
        throw errors.OPERATION_FAILED({ operation: 'Deployment', target: result.failed });
      }

      log.success(`✅ Single module deployment complete for ${name}.`);
    }
  }

  /**
   * Reverts database changes for modules. Unlike verify operations, revert operations
   * modify database state and must ensure dependent modules are reverted before their
   * dependencies to prevent database constraint violations.
   */
  async revert(
    opts: LaunchQLOptions,
    target?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('revert');

    const { name, toChange } = this.parsePackageTarget(target);

    if (recursive) {
      const modules = this.getModuleMap();
      
      // Mirror deploy logic: find all modules that depend on the target module
      let extensionsToRevert: { resolved: string[]; external: string[] };
      
      if (name === null) {
        // When name is null, revert ALL modules in the workspace
        extensionsToRevert = this.resolveWorkspaceExtensionDependencies();
      } else {
        // Always use workspace-wide resolution in recursive mode
        // This ensures all dependent modules are reverted before their dependencies.
        const workspaceExtensions = this.resolveWorkspaceExtensionDependencies();
        extensionsToRevert = truncateExtensionsToTarget(workspaceExtensions, name);
      }

      const pgPool = getPgPool(opts.pg);

      const targetDescription = name === null ? 'all modules' : name;
      log.success(`🧹 Starting revert process on database ${opts.pg.database}...`);

      const reversedExtensions = [...extensionsToRevert.resolved].reverse();

      for (const extension of reversedExtensions) {
        try {
          if (extensionsToRevert.external.includes(extension)) {
            const msg = `DROP EXTENSION IF EXISTS "${extension}" RESTRICT;`;
            log.warn(`⚠️ Dropping external extension: ${extension}`);
            try {
              await pgPool.query(msg);
            } catch (err: any) {
              if (err.code === '2BP01') {
                log.warn(`⚠️ Cannot drop extension ${extension} due to dependencies, skipping`);
              } else {
                throw err;
              }
            }
          } else {
            const modulePath = resolve(this.workspacePath!, modules[extension].path);
            log.info(`📂 Reverting local module: ${extension}`);
          
            try {
              const client = new LaunchQLMigrate(opts.pg as PgConfig);
            
              // Only apply toChange to the target module, not its dependencies
              const moduleToChange = extension === name ? toChange : undefined;
              const result = await client.revert({
                modulePath,
                toChange: moduleToChange,
                useTransaction: opts.deployment.useTx
              });
            
              if (result.failed) {
                throw errors.OPERATION_FAILED({ operation: 'Revert', target: result.failed });
              }
            } catch (revertError) {
              log.error(`❌ Revert failed for module ${extension}`);
              throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
            }
          }
        } catch (e) {
          log.error(`🛑 Error during revert: ${e instanceof Error ? e.message : e}`);
          console.error(e);
          throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
        }
      }

      log.success(`✅ Revert complete for ${targetDescription}.`);
    } else {
      if (name === null) {
        throw errors.WORKSPACE_OPERATION_ERROR({ operation: 'revert' });
      }
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw errors.PATH_NOT_FOUND({ path: name, type: 'module' });
      }

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.revert({
        modulePath,
        toChange,
        useTransaction: opts.deployment?.useTx
      });

      if (result.failed) {
        throw errors.OPERATION_FAILED({ operation: 'Revert', target: result.failed });
      }

      log.success(`✅ Single module revert complete for ${name}.`);
    }
  }

  async verify(
    opts: LaunchQLOptions,
    target?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('verify');

    const { name, toChange } = this.parsePackageTarget(target);

    if (recursive) {
      const modules = this.getModuleMap();
      
      let extensions: { resolved: string[]; external: string[] };
      
      if (name === null) {
        // When name is null, verify ALL modules in the workspace
        extensions = this.resolveWorkspaceExtensionDependencies();
      } else {
        const moduleProject = this.getModuleProject(name);
        extensions = moduleProject.getModuleExtensions();
      }

      const pgPool = getPgPool(opts.pg);

      const targetDescription = name === null ? 'all modules' : name;
      log.success(`🔎 Verifying deployment of ${targetDescription} on database ${opts.pg.database}...`);

      for (const extension of extensions.resolved) {
        try {
          if (extensions.external.includes(extension)) {
            const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
            log.info(`🔍 Verifying external extension: ${extension}`);
            await pgPool.query(query, [extension]);
          } else {
            const modulePath = resolve(this.workspacePath!, modules[extension].path);
            log.info(`📂 Verifying local module: ${extension}`);

            try {
              const client = new LaunchQLMigrate(opts.pg as PgConfig);
            
              // Only apply toChange to the target module, not its dependencies
              const moduleToChange = extension === name ? toChange : undefined;
              const result = await client.verify({
                modulePath,
                toChange: moduleToChange
              });
            
              if (result.failed.length > 0) {
                throw errors.OPERATION_FAILED({ operation: 'Verification', reason: `${result.failed.length} changes: ${result.failed.join(', ')}` });
              }
            } catch (verifyError) {
              log.error(`❌ Verification failed for module ${extension}`);
              throw errors.DEPLOYMENT_FAILED({ type: 'Verify', module: extension });
            }
          }
        } catch (e) {
          log.error(`🛑 Error during verification: ${e instanceof Error ? e.message : e}`);
          console.error(e);
          throw errors.DEPLOYMENT_FAILED({ type: 'Verify', module: extension });
        }
      }

      log.success(`✅ Verification complete for ${targetDescription}.`);
    } else {
      if (name === null) {
        throw errors.WORKSPACE_OPERATION_ERROR({ operation: 'verification' });
      }
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw errors.PATH_NOT_FOUND({ path: name, type: 'module' });
      }

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.verify({
        modulePath,
        toChange
      });

      if (result.failed.length > 0) {
        throw errors.OPERATION_FAILED({ operation: 'Verification', reason: `${result.failed.length} changes: ${result.failed.join(', ')}` });
      }

      log.success(`✅ Single module verification complete for ${name}.`);
    }
  }

  async removeFromPlan(toChange: string): Promise<void> {
    const log = new Logger('remove');
    const modulePath = this.getModulePath();
    if (!modulePath) {
      throw errors.PATH_NOT_FOUND({ path: 'module path', type: 'module' });
    }
    
    const planPath = path.join(modulePath, 'launchql.plan');
    const result = parsePlanFile(planPath);
    
    if (result.errors.length > 0) {
      throw errors.PLAN_PARSE_ERROR({ planPath, errors: result.errors.map(e => e.message).join(', ') });
    }
    
    const plan = result.data!;

    if (toChange.startsWith('@')) {
      const tagName = toChange.substring(1); // Remove the '@' prefix
      const tagToRemove = plan.tags.find(tag => tag.name === tagName);
      if (!tagToRemove) {
        throw errors.TAG_NOT_FOUND({ tag: toChange });
      }
      
      const tagChangeIndex = plan.changes.findIndex(c => c.name === tagToRemove.change);
      if (tagChangeIndex === -1) {
        throw errors.CHANGE_NOT_FOUND({ change: tagToRemove.change, plan: `for tag '${toChange}'` });
      }
      
      const changesToRemove = plan.changes.slice(tagChangeIndex);
      plan.changes = plan.changes.slice(0, tagChangeIndex);
      
      plan.tags = plan.tags.filter(tag => 
        tag.name !== tagName && !changesToRemove.some(change => change.name === tag.change)
      );
      
      for (const change of changesToRemove) {
        for (const scriptType of ['deploy', 'revert', 'verify']) {
          const scriptPath = path.join(modulePath, scriptType, `${change.name}.sql`);
          if (fs.existsSync(scriptPath)) {
            fs.unlinkSync(scriptPath);
            log.info(`Deleted ${scriptType}/${change.name}.sql`);
          }
        }
      }
      
      // Write updated plan file
      writePlanFile(planPath, plan);
      log.success(`Removed tag ${toChange} and ${changesToRemove.length} subsequent changes from plan`);
      return;
    }

    const targetIndex = plan.changes.findIndex(c => c.name === toChange);
    if (targetIndex === -1) {
      throw errors.CHANGE_NOT_FOUND({ change: toChange });
    }

    const changesToRemove = plan.changes.slice(targetIndex);
    plan.changes = plan.changes.slice(0, targetIndex);
    
    plan.tags = plan.tags.filter(tag => 
      !changesToRemove.some(change => change.name === tag.change)
    );
    
    for (const change of changesToRemove) {
      for (const scriptType of ['deploy', 'revert', 'verify']) {
        const scriptPath = path.join(modulePath, scriptType, `${change.name}.sql`);
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
          log.info(`Deleted ${scriptType}/${change.name}.sql`);
        }
      }
    }
    
    // Write updated plan file
    writePlanFile(planPath, plan);
    log.success(`Removed ${changesToRemove.length} changes from plan`);
  }

  analyzeModule(): PackageAnalysisResult {
    this.ensureModule();
    const info = this.getModuleInfo();
    const modPath = this.getModulePath()!;
    const issues: PackageAnalysisIssue[] = [];
    const exists = (p: string) => fs.existsSync(p);
    const read = (p: string) => (exists(p) ? fs.readFileSync(p, 'utf8') : undefined);
    const planPath = path.join(modPath, 'launchql.plan');
    if (!exists(planPath)) issues.push({ code: 'missing_plan', message: 'Missing launchql.plan', file: planPath });
    const pkgJsonPath = path.join(modPath, 'package.json');
    if (!exists(pkgJsonPath)) issues.push({ code: 'missing_package_json', message: 'Missing package.json', file: pkgJsonPath });
    const makefilePath = info.Makefile;
    if (!exists(makefilePath)) issues.push({ code: 'missing_makefile', message: 'Missing Makefile', file: makefilePath });
    const controlPath = info.controlFile;
    if (!exists(controlPath)) issues.push({ code: 'missing_control', message: 'Missing control file', file: controlPath });
    const sqlCombined = info.sqlFile ? path.join(modPath, info.sqlFile) : path.join(modPath, 'sql', `${info.extname}--${info.version}.sql`);
    if (!exists(sqlCombined)) issues.push({ code: 'missing_sql', message: 'Missing combined sql file', file: sqlCombined });
    const deployDir = path.join(modPath, 'deploy');
    if (!exists(deployDir)) issues.push({ code: 'missing_deploy_dir', message: 'Missing deploy directory', file: deployDir });
    const revertDir = path.join(modPath, 'revert');
    if (!exists(revertDir)) issues.push({ code: 'missing_revert_dir', message: 'Missing revert directory', file: revertDir });
    const verifyDir = path.join(modPath, 'verify');
    if (!exists(verifyDir)) issues.push({ code: 'missing_verify_dir', message: 'Missing verify directory', file: verifyDir });
    if (exists(planPath)) {
      try {
        const parsed = parsePlanFile(planPath);
        const pkgName = parsed.data?.package;
        if (!pkgName) issues.push({ code: 'plan_missing_project', message: '%project missing', file: planPath });
        if (pkgName && pkgName !== info.extname) issues.push({ code: 'plan_project_mismatch', message: `launchql.plan %project ${pkgName} != ${info.extname}`, file: planPath });
        const uri = parsed.data?.uri;
        if (uri && uri !== info.extname) issues.push({ code: 'plan_uri_mismatch', message: `launchql.plan %uri ${uri} != ${info.extname}`, file: planPath });
      } catch (e: any) {
        issues.push({ code: 'plan_parse_error', message: e?.message || 'Plan parse error', file: planPath });
      }
    }
    if (exists(makefilePath)) {
      const mf = read(makefilePath) || '';
      const extMatch = mf.match(/^EXTENSION\s*=\s*(.+)$/m);
      const dataMatch = mf.match(/^DATA\s*=\s*sql\/(.+)\.sql$/m);
      if (!extMatch) issues.push({ code: 'makefile_missing_extension', message: 'Makefile missing EXTENSION', file: makefilePath });
      if (!dataMatch) issues.push({ code: 'makefile_missing_data', message: 'Makefile missing DATA', file: makefilePath });
      if (extMatch && extMatch[1].trim() !== info.extname) issues.push({ code: 'makefile_extension_mismatch', message: `Makefile EXTENSION ${extMatch[1].trim()} != ${info.extname}`, file: makefilePath });
      const expectedData = `${info.extname}--${info.version}`;
      if (dataMatch && dataMatch[1].trim() !== expectedData) issues.push({ code: 'makefile_data_mismatch', message: `Makefile DATA sql/${dataMatch[1].trim()}.sql != sql/${expectedData}.sql`, file: makefilePath });
    }
    if (exists(controlPath)) {
      const base = path.basename(controlPath);
      const expected = `${info.extname}.control`;
      if (base !== expected) issues.push({ code: 'control_filename_mismatch', message: `Control filename ${base} != ${expected}`, file: controlPath });
    }
    return { ok: issues.length === 0, name: info.extname, path: modPath, issues };
  }

  renameModule(newName: string, opts?: RenameOptions): { changed: string[]; warnings: string[] } {
    this.ensureModule();
    const info = this.getModuleInfo();
    const modPath = this.getModulePath()!;
    const changed: string[] = [];
    const warnings: string[] = [];
    const dry = !!opts?.dryRun;
    const valid = /^[a-z][a-z0-9_]*$/;
    if (!valid.test(newName)) {
      throw errors.INVALID_NAME({ name: newName, type: 'module', rules: 'lowercase letters, digits, underscores; must start with letter' });
    }
    const planPath = path.join(modPath, 'launchql.plan');
    if (fs.existsSync(planPath)) {
      try {
        const parsed = parsePlanFile(planPath);
        if (parsed.data) {
          parsed.data.package = newName;
          parsed.data.uri = newName;
          if (!dry) writePlanFile(planPath, parsed.data);
          changed.push(planPath);
        }
      } catch (e) {
        warnings.push(`failed to update launchql.plan`);
      }
    } else {
      warnings.push('missing launchql.plan');
    }
    const pkgJsonPath = path.join(modPath, 'package.json');
    if (fs.existsSync(pkgJsonPath) && opts?.syncPackageJsonName) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        const oldName = pkg.name as string | undefined;
        if (oldName) {
          if (oldName.startsWith('@')) {
            const parts = oldName.split('/');
            if (parts.length === 2) pkg.name = `${parts[0]}/${newName}`;
            else pkg.name = newName;
          } else {
            pkg.name = newName;
          }
        } else {
          pkg.name = newName;
        }
        if (!dry) fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
        changed.push(pkgJsonPath);
      } catch {
        warnings.push('failed to update package.json name');
      }
    }
    const oldControl = info.controlFile;
    const newControl = path.join(modPath, `${newName}.control`);
    const version = info.version;
    const requires = (() => {
      try {
        const c = fs.readFileSync(oldControl, 'utf8');
        const line = c.split('\n').find(l => /^requires/.test(l));
        if (!line) return [];
        return line.split('=')[1].split("'")[1].split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        return [];
      }
    })();
    if (fs.existsSync(oldControl)) {
      if (!dry) {
        const content = generateControlFileContent({ name: newName, version, requires });
        fs.writeFileSync(newControl, content);
        if (oldControl !== newControl && fs.existsSync(oldControl)) fs.rmSync(oldControl);
      }
      changed.push(newControl);
    } else {
      warnings.push('missing control file');
    }
    const makefilePath = info.Makefile;
    if (fs.existsSync(makefilePath)) {
      if (!dry) writeExtensionMakefile(makefilePath, newName, version);
      changed.push(makefilePath);
    } else {
      warnings.push('missing Makefile');
    }
    const oldSql = path.join(modPath, 'sql', `${info.extname}--${version}.sql`);
    const newSql = path.join(modPath, 'sql', `${newName}--${version}.sql`);
    if (fs.existsSync(oldSql)) {
      if (!dry) {
        if (oldSql !== newSql) {
          fs.mkdirSync(path.dirname(newSql), { recursive: true });
          fs.renameSync(oldSql, newSql);
        }
      }
      changed.push(newSql);
    } else {
      if (fs.existsSync(newSql)) {
        changed.push(newSql);
      } else {
        warnings.push('missing combined sql file');
      }
    }
    this.clearCache();
    return { changed, warnings };
  }

  /**
   * Validate module consistency before bumping
   * Returns validation result with issues if any
   */
  validateModule(): { ok: boolean; issues: Array<{ code: string; message: string; file?: string }> } {
    const analysisResult = this.analyzeModule();
    const issues = [...analysisResult.issues];
    
    if (!this.isInModule()) {
      issues.push({
        code: 'not_in_module',
        message: 'This command must be run inside a LaunchQL module.'
      });
      return { ok: false, issues };
    }

    const modPath = this.getModulePath()!;
    const info = this.getModuleInfo();
    
    try {
      const pkgJsonPath = path.join(modPath, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) {
        issues.push({
          code: 'missing_package_json',
          message: 'package.json not found',
          file: pkgJsonPath
        });
      } else {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        const pkgVersion = pkg.version;

        if (!pkgVersion) {
          issues.push({
            code: 'missing_version',
            message: 'No version found in package.json',
            file: pkgJsonPath
          });
        } else {
          const controlContent = this.getModuleControlFile();
          const defaultVersionMatch = controlContent.match(/^default_version\s*=\s*'([^']+)'/m);
          
          if (!defaultVersionMatch) {
            issues.push({
              code: 'missing_default_version',
              message: 'Control file missing default_version',
              file: info.controlFile
            });
          } else {
            const controlVersion = defaultVersionMatch[1];
            if (controlVersion !== pkgVersion) {
              issues.push({
                code: 'version_mismatch',
                message: `Version mismatch: control file default_version '${controlVersion}' !== package.json version '${pkgVersion}'`,
                file: info.controlFile
              });
            }
          }

          const sqlFile = path.join(modPath, 'sql', `${info.extname}--${pkgVersion}.sql`);
          if (!fs.existsSync(sqlFile)) {
            issues.push({
              code: 'missing_sql_migration',
              message: `SQL migration file missing: sql/${info.extname}--${pkgVersion}.sql`,
              file: sqlFile
            });
          }

          const planPath = path.join(modPath, 'launchql.plan');
          if (fs.existsSync(planPath)) {
            try {
              const planContent = fs.readFileSync(planPath, 'utf8');
              const hasVersionTag = planContent.includes(`@v${pkgVersion}`) || planContent.includes(`@${pkgVersion}`);
              if (!hasVersionTag) {
                issues.push({
                  code: 'missing_version_tag',
                  message: `launchql.plan missing tag for version ${pkgVersion}`,
                  file: planPath
                });
              }
            } catch (e) {
              issues.push({
                code: 'plan_read_error',
                message: `Failed to read launchql.plan: ${e}`,
                file: planPath
              });
            }
          }
        }
      }
    } catch (error) {
      issues.push({
        code: 'validation_error',
        message: `Validation failed: ${error}`
      });
    }

    return { ok: issues.length === 0, issues };
  }

  /**
   * Synchronize artifacts with the new bumped version
   * Updates control file and creates SQL migration file
   */
  syncModule(version?: string): { success: boolean; message: string; files: string[] } {
    if (!this.isInModule()) {
      return {
        success: false,
        message: 'This command must be run inside a LaunchQL module.',
        files: []
      };
    }

    const modPath = this.getModulePath()!;
    const info = this.getModuleInfo();
    const files: string[] = [];
    
    try {
      let targetVersion = version;
      
      if (!targetVersion) {
        const pkgJsonPath = path.join(modPath, 'package.json');
        if (!fs.existsSync(pkgJsonPath)) {
          return {
            success: false,
            message: 'package.json not found',
            files: []
          };
        }

        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        targetVersion = pkg.version;

        if (!targetVersion) {
          return {
            success: false,
            message: 'No version found in package.json',
            files: []
          };
        }
      }

      // Update control file
      const controlPath = info.controlFile;
      const requires = this.getRequiredModules();
      
      const controlContent = generateControlFileContent({
        name: info.extname,
        version: targetVersion,
        requires
      });

      fs.writeFileSync(controlPath, controlContent);
      files.push(path.relative(modPath, controlPath));

      // Create SQL migration file if it doesn't exist
      const sqlDir = path.join(modPath, 'sql');
      if (!fs.existsSync(sqlDir)) {
        fs.mkdirSync(sqlDir, { recursive: true });
      }

      const sqlFile = path.join(sqlDir, `${info.extname}--${targetVersion}.sql`);
      if (!fs.existsSync(sqlFile)) {
        const sqlContent = `-- ${info.extname} extension version ${targetVersion}
-- This file contains the SQL commands to create the extension

-- Add your SQL commands here
`;
        fs.writeFileSync(sqlFile, sqlContent);
        files.push(`sql/${info.extname}--${targetVersion}.sql`);
      }

      return {
        success: true,
        message: `Sync completed successfully for version ${targetVersion}`,
        files
      };

    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error}`,
        files
      };
    }
  }

  /**
   * Version workspace packages like lerna version
   * Detects changed packages, bumps versions, updates dependencies
   */
  versionWorkspace(options: {
    filter?: string;
    bump?: 'patch' | 'minor' | 'major' | 'prerelease' | 'exact';
    exact?: string;
    dryRun?: boolean;
  } = {}): { success: boolean; message: string; packages: Array<{ name: string; oldVersion: string; newVersion: string }> } {
    
    if (!this.isInWorkspace()) {
      return {
        success: false,
        message: 'This command must be run from a workspace root.',
        packages: []
      };
    }

    try {
      const workspacePath = this.getWorkspacePath()!;
      const moduleMap = this.getModuleMap();
      const changedPackages: Array<{ name: string; path: string; oldVersion: string; newVersion: string }> = [];
      
      // Helper function to bump version
      const bumpVersion = (version: string, bumpType: string, exactVersion?: string): string => {
        if (bumpType === 'exact' && exactVersion) {
          return exactVersion;
        }

        const parts = version.split('.').map(Number);
        const [major, minor, patch] = parts;

        switch (bumpType) {
          case 'major':
            return `${major + 1}.0.0`;
          case 'minor':
            return `${major}.${minor + 1}.0`;
          case 'patch':
            return `${major}.${minor}.${patch + 1}`;
          case 'prerelease':
            return `${major}.${minor}.${patch + 1}-alpha.0`;
          default:
            return version;
        }
      };

      for (const [moduleName, moduleInfo] of Object.entries(moduleMap)) {
        if (options.filter && !moduleName.includes(options.filter)) {
          continue;
        }
        
        const modulePath = path.join(workspacePath, moduleInfo.path);
        const pkgJsonPath = path.join(modulePath, 'package.json');
        
        if (!fs.existsSync(pkgJsonPath)) {
          continue;
        }
        
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        const currentVersion = pkg.version;
        
        if (!currentVersion) {
          continue;
        }
        
        let changed = true;
        
        try {
          const lastTag = execSync(`git describe --tags --abbrev=0 --match="${moduleName}@*" 2>/dev/null || echo ""`, {
            cwd: workspacePath,
            encoding: 'utf8'
          }).trim();
          
          if (lastTag) {
            const commitsSince = execSync(`git rev-list --count ${lastTag}..HEAD -- ${moduleInfo.path}`, {
              cwd: workspacePath,
              encoding: 'utf8'
            }).trim();
            
            changed = parseInt(commitsSince) > 0;
          }
        } catch (error) {
        }
        
        if (changed) {
          const bumpType = options.bump || 'patch';
          const newVersion = bumpVersion(currentVersion, bumpType, options.exact);
          
          changedPackages.push({
            name: moduleName,
            path: modulePath,
            oldVersion: currentVersion,
            newVersion
          });
        }
      }
      
      if (changedPackages.length === 0) {
        return {
          success: true,
          message: 'No packages have changed since last release',
          packages: []
        };
      }
      
      if (options.dryRun) {
        return {
          success: true,
          message: `Dry run mode - would update ${changedPackages.length} packages`,
          packages: changedPackages.map(pkg => ({
            name: pkg.name,
            oldVersion: pkg.oldVersion,
            newVersion: pkg.newVersion
          }))
        };
      }
      
      // Update package versions and dependencies
      const packageUpdates = new Map<string, string>();
      for (const pkg of changedPackages) {
        packageUpdates.set(pkg.name, pkg.newVersion);
      }
      
      // Helper function to update dependency ranges
      const updateDependencyRanges = (pkgJson: any, packageUpdates: Map<string, string>): boolean => {
        let updated = false;
        
        const updateDeps = (deps: Record<string, string> | undefined) => {
          if (!deps) return;
          
          for (const [depName, depVersion] of Object.entries(deps)) {
            if (packageUpdates.has(depName)) {
              const newVersion = packageUpdates.get(depName)!;
              
              if (depVersion.startsWith('workspace:')) {
                continue;
              }
              
              if (depVersion.startsWith('^')) {
                deps[depName] = `^${newVersion}`;
                updated = true;
              } else if (depVersion.startsWith('~')) {
                deps[depName] = `~${newVersion}`;
                updated = true;
              }
            }
          }
        };

        updateDeps(pkgJson.dependencies);
        updateDeps(pkgJson.devDependencies);
        updateDeps(pkgJson.peerDependencies);
        
        return updated;
      };
      
      // Update each package
      for (const pkg of changedPackages) {
        const pkgJsonPath = path.join(pkg.path, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        
        pkgJson.version = pkg.newVersion;
        updateDependencyRanges(pkgJson, packageUpdates);
        
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
        
        try {
          const moduleProject = new LaunchQLPackage(pkg.path);
          moduleProject.syncModule(pkg.newVersion);
        } catch (error) {
        }
      }
      
      // Git operations
      const filesToAdd = [];
      for (const pkg of changedPackages) {
        filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, 'package.json')));
        filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, `${pkg.name}.control`)));
        filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, 'sql', `${pkg.name}--${pkg.newVersion}.sql`)));
      }
      
      for (const file of filesToAdd) {
        try {
          execSync(`git add "${file}"`, { cwd: workspacePath });
        } catch (error) {
          // Continue if file doesn't exist
        }
      }
      
      const commitMessage = 'chore(release): publish';
      execSync(`git commit -m "${commitMessage}"`, { cwd: workspacePath });
      
      for (const pkg of changedPackages) {
        const tag = `${pkg.name}@${pkg.newVersion}`;
        execSync(`git tag "${tag}"`, { cwd: workspacePath });
      }
      
      return {
        success: true,
        message: `Successfully versioned ${changedPackages.length} packages`,
        packages: changedPackages.map(pkg => ({
          name: pkg.name,
          oldVersion: pkg.oldVersion,
          newVersion: pkg.newVersion
        }))
      };

    } catch (error) {
      return {
        success: false,
        message: `Version command failed: ${error}`,
        packages: []
      };
    }
  }
}
