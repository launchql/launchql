import { loadConfigSyncFromDir, resolvePgpmPath,walkUp } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import { errors, PgpmOptions, PgpmWorkspaceConfig } from '@pgpmjs/types';
import yanse from 'yanse';
import { execSync } from 'child_process';
import fs from 'fs';
import * as glob from 'glob';
import os from 'os';
import { parse } from 'parse-package-name';
import path, { dirname, resolve } from 'path';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

import { DEFAULT_TEMPLATE_REPO, DEFAULT_TEMPLATE_TTL_MS, DEFAULT_TEMPLATE_TOOL_NAME, scaffoldTemplate } from '../template-scaffold';
import { getAvailableExtensions } from '../../extensions/extensions';
import { generatePlan, writePlan, writePlanFile } from '../../files';
import { Tag, ExtendedPlanFile, Change } from '../../files/types';
import { parsePlanFile } from '../../files/plan/parser';
import { isValidTagName, isValidChangeName, parseReference } from '../../files/plan/validators';
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
import { PgpmMigrate } from '../../migrate/client';
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


const logger = new Logger('pgpm');

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
  branch?: string;
  templateRepo?: string;
  templatePath?: string;
  cacheTtlMs?: number;
  noTty?: boolean;
  toolName?: string;
  answers?: Record<string, any>;
}

export class PgpmPackage {
  public cwd: string;
  public workspacePath?: string;
  public modulePath?: string;
  public config?: PgpmWorkspaceConfig;
  public allowedDirs: string[] = [];
  public allowedParentDirs: string[] = [];

  private _moduleMap?: ModuleMap;
  private _moduleInfo?: ExtensionInfo;

  constructor(cwd: string = process.cwd()) {
    this.resetCwd(cwd);
  }

  resetCwd(cwd: string) {
    this.cwd = cwd;
    this.workspacePath = resolvePgpmPath(this.cwd);
    this.modulePath = this.resolveSqitchPath();

    if (this.workspacePath) {
      this.config = this.loadConfigSync();
      this.allowedDirs = this.loadAllowedDirs();
      this.allowedParentDirs = this.loadAllowedParentDirs();
    }
  }

  private resolveSqitchPath(): string | undefined {
    try {
      return walkUp(this.cwd, 'pgpm.plan');
    } catch {
      return undefined;
    }
  }

  private loadConfigSync(): PgpmWorkspaceConfig {
    return loadConfigSyncFromDir(this.workspacePath!) as PgpmWorkspaceConfig;
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

  private loadAllowedParentDirs(): string[] {
    const globs: string[] = this.config?.packages ?? [];
    const parentDirs = globs.map(pattern => {
      // Remove glob characters (*, **, ?, etc.) to get the base path
      const basePath = pattern.replace(/[*?[\]{}]/g, '').replace(/\/$/, '');
      return path.resolve(this.workspacePath!, basePath);
    });
    // Remove duplicates by converting to Set and back to array
    return [...new Set(parentDirs)];
  }

  isInsideAllowedDirs(cwd: string): boolean {
    return this.allowedDirs.some(dir => cwd.startsWith(dir));
  }

  isParentOfAllowedDirs(cwd: string): boolean {
    const resolvedCwd = path.resolve(cwd);
    return this.allowedDirs.some(dir => dir.startsWith(resolvedCwd + path.sep)) ||
           this.allowedParentDirs.some(dir => path.resolve(dir) === resolvedCwd);
  }

  private createModuleDirectory(modName: string): string {
    this.ensureWorkspace();

    const isRoot = path.resolve(this.workspacePath!) === path.resolve(this.cwd);
    const isParentDir = this.isParentOfAllowedDirs(this.cwd);
    const isInsideModule = this.isInsideAllowedDirs(this.cwd);
    let targetPath: string;

    if (isRoot) {
      const packagesDir = path.join(this.cwd, 'packages');
      fs.mkdirSync(packagesDir, { recursive: true });
      targetPath = path.join(packagesDir, modName);
    } else if (isParentDir) {
      targetPath = path.join(this.cwd, modName);
    } else if (isInsideModule) {
      console.error(yanse.red(`Error: Cannot create a module inside an existing module. Please run 'lql init' from the workspace root or from a parent directory like 'packages/'.`));
      process.exit(1);
    } else {
      console.error(yanse.red(`Error: You must be inside the workspace root, a parent directory of modules (like 'packages/'), or inside one of the workspace packages: ${this.allowedDirs.join(', ')}`));
      process.exit(1);
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

  async getModules(): Promise<PgpmPackage[]> {
    if (!this.workspacePath || !this.config) return [];

    const dirs = this.loadAllowedDirs();
    const results: PgpmPackage[] = [];

    for (const dir of dirs) {
      const proj = new PgpmPackage(dir);
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

  getModuleProject(name: string): PgpmPackage {
    this.ensureWorkspace();
    
    if (this.isInModule() && name === this.getModuleName()) {
      return this;
    }
    
    const modules = this.getModuleMap();
    if (!modules[name]) {
      throw errors.MODULE_NOT_FOUND({ name });
    }
    
    const modulePath = path.resolve(this.workspacePath!, modules[name].path);
    return new PgpmPackage(modulePath);
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
    const plan = generatePlan({
      moduleName: modName,
      uri: modName,
      entries: []
    });
    writePlan(path.join(targetPath, 'pgpm.plan'), plan);
    
    // Create deploy, revert, and verify directories
    const dirs = ['deploy', 'revert', 'verify'];
    dirs.forEach(dir => {
      const dirPath = path.join(targetPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  async initModule(options: InitModuleOptions): Promise<void> {
    this.ensureWorkspace();
    const targetPath = this.createModuleDirectory(options.name);
    
    const answers = {
      ...options.answers,
      name: options.name,
      moduleDesc: options.description,
      description: options.description,
      author: options.author,
      extensions: options.extensions
    };

    await scaffoldTemplate({
      type: 'module',
      outputDir: targetPath,
      templateRepo: options.templateRepo ?? DEFAULT_TEMPLATE_REPO,
      branch: options.branch,
      // Don't set default templatePath - let scaffoldTemplate use metadata-driven resolution
      templatePath: options.templatePath,
      answers,
      noTty: options.noTty ?? false,
      cacheTtlMs: options.cacheTtlMs ?? DEFAULT_TEMPLATE_TTL_MS,
      toolName: options.toolName ?? DEFAULT_TEMPLATE_TOOL_NAME,
      cwd: this.cwd
    });

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
    const planPath = path.join(this.getModulePath()!, 'pgpm.plan');
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
                const planPath = path.join(this.workspacePath, modInfo.path, 'pgpm.plan');
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
    const planPath = path.join(this.workspacePath!, mod.path, 'pgpm.plan');
    
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
    
    const planPath = path.join(this.modulePath, 'pgpm.plan');
    
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

  /**
   * Add a change to the current module's plan file and create SQL files
   */
  addChange(changeName: string, dependencies?: string[], comment?: string): void {
    // Validate change name first
    if (!changeName || !changeName.trim()) {
      throw new Error('Change name is required');
    }
    
    if (!isValidChangeName(changeName)) {
      throw errors.INVALID_NAME({ name: changeName, type: 'change', rules: "Change names must follow Sqitch naming rules" });
    }
    
    if (!this.isInWorkspace() && !this.isInModule()) {
      throw new Error('This command must be run inside a PGPM workspace or module.');
    }
    
    if (this.isInModule()) {
      this.ensureModule();
      
      if (!this.modulePath) {
        throw errors.PATH_NOT_FOUND({ path: 'module path', type: 'module' });
      }
      
      this.addChangeToModule(changeName, dependencies, comment);
      return;
    }
    
    throw new Error('When running from workspace root, please specify --package or run from within a module directory.');
  }
  
  /**
   * Add change to the current module (internal helper)
   */
  private addChangeToModule(changeName: string, dependencies?: string[], comment?: string): void {
    const planPath = path.join(this.modulePath!, 'pgpm.plan');
    
    // Parse existing plan file
    const planResult = parsePlanFile(planPath);
    if (!planResult.data) {
      throw errors.PLAN_PARSE_ERROR({ planPath, errors: planResult.errors.map(e => e.message).join(', ') });
    }
    
    const plan = planResult.data;
    
    // Check if change already exists
    const existingChange = plan.changes.find(c => c.name === changeName);
    if (existingChange) {
      throw new Error(`Change '${changeName}' already exists in plan.`);
    }
    
    // Validate dependencies exist if provided
    if (dependencies && dependencies.length > 0) {
      const currentPackage = plan.package;
      
      for (const dep of dependencies) {
        // Parse the dependency to check if it's a cross-module reference
        const parsed = parseReference(dep);
        
        if (parsed && parsed.package && parsed.package !== currentPackage) {
          continue;
        }
        
        const depExists = plan.changes.some(c => c.name === dep);
        if (!depExists) {
          throw new Error(`Dependency '${dep}' not found in plan. Add dependencies before referencing them.`);
        }
      }
    }
    
    // Create new change
    const newChange: Change = {
      name: changeName,
      dependencies: dependencies || [],
      timestamp: getPlanTimestamp(),
      planner: 'launchql',
      email: 'launchql@5b0c196eeb62',
      comment: comment || `add ${changeName}`
    };
    
    plan.changes.push(newChange);
    
    // Write updated plan file
    writePlanFile(planPath, plan);
    
    // Create SQL files
    this.createSqlFiles(changeName, dependencies || [], comment || `add ${changeName}`);
  }

  /**
   * Create deploy/revert/verify SQL files for a change
   */
  private createSqlFiles(changeName: string, dependencies: string[], comment: string): void {
    if (!this.modulePath) {
      throw errors.PATH_NOT_FOUND({ path: 'module path', type: 'module' });
    }

    const createdFiles: string[] = [];

    const createSqlFile = (type: 'deploy' | 'revert' | 'verify', content: string) => {
      const dir = path.dirname(changeName);
      const fileName = path.basename(changeName);
      const typeDir = path.join(this.modulePath!, type);
      const targetDir = path.join(typeDir, dir);
      const filePath = path.join(targetDir, `${fileName}.sql`);
      
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(filePath, content);
      
      // Track the relative path from module root
      const relativePath = path.relative(this.modulePath!, filePath);
      createdFiles.push(relativePath);
    };

    // Create deploy file
    const deployContent = `-- Deploy: ${changeName}
-- made with <3 @ constructive.io

${dependencies.length > 0 ? dependencies.map(dep => `-- requires: ${dep}`).join('\n') + '\n' : ''}
-- Add your deployment SQL here
`;

    // Create revert file  
    const revertContent = `-- Revert: ${changeName}

-- Add your revert SQL here
`;

    // Create verify file
    const verifyContent = `-- Verify: ${changeName}

-- Add your verification SQL here
`;

    createSqlFile('deploy', deployContent);
    createSqlFile('revert', revertContent);
    createSqlFile('verify', verifyContent);

    // Log created files to stdout
    process.stdout.write('\n✔ Files created\n\n');
    createdFiles.forEach(file => {
      process.stdout.write(`   create  ${file}\n`);
    });
    process.stdout.write('\n✨ All set!\n\n');
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
    const files = ['Makefile', 'package.json', 'pgpm.plan', controlFile];


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
  
        const matches = glob.sync('./extensions/**/pgpm.plan');
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

  /**
   * Get the set of modules that have been deployed to the database
   */
  private async getDeployedModules(pgConfig: PgConfig): Promise<Set<string>> {
    try {
      const client = new PgpmMigrate(pgConfig);
      await client.initialize();
      
      const status = await client.status();
      return new Set(status.map(s => s.package));
    } catch (error: any) {
      if (error.code === '42P01' || error.code === '3F000') {
        return new Set();
      }
      throw error;
    }
  }

  public async resolveWorkspaceExtensionDependencies(
    opts?: { filterDeployed?: boolean; pgConfig?: PgConfig }
  ): Promise<{ resolved: string[]; external: string[] }> {
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
    
    let filteredResolved = resolved.filter((moduleName: string) => moduleName !== virtualModuleName);
    
    // Filter by deployment status if requested
    if (opts?.filterDeployed && opts?.pgConfig) {
      const deployedModules = await this.getDeployedModules(opts.pgConfig);
      filteredResolved = filteredResolved.filter(module => deployedModules.has(module));
    }
    
    return {
      resolved: filteredResolved,
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
        throw new Error('Not in a PGPM workspace or module');
      }
    } else {
      const parsed = parseTarget(target);
      name = parsed.packageName;
      toChange = parsed.toChange;
    }

    return { name, toChange };
  }

  async deploy(
    opts: PgpmOptions,
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
        extensions = await this.resolveWorkspaceExtensionDependencies();
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
                } else if (err.message && err.message.includes('pgpm.plan')) {
                  errorLines.push('💡 Hint: pgpm.plan file issue. Check if the plan file exists and is valid.');
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
                const client = new PgpmMigrate(opts.pg as PgConfig);
              
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

      const client = new PgpmMigrate(opts.pg as PgConfig);
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
    opts: PgpmOptions,
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
        // When name is null, revert ALL deployed modules in the workspace
        extensionsToRevert = await this.resolveWorkspaceExtensionDependencies({
          filterDeployed: true,
          pgConfig: opts.pg as PgConfig
        });
      } else {
        // Always use workspace-wide resolution in recursive mode, but filter to deployed modules
        const workspaceExtensions = await this.resolveWorkspaceExtensionDependencies({
          filterDeployed: true,
          pgConfig: opts.pg as PgConfig
        });
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
              const client = new PgpmMigrate(opts.pg as PgConfig);
            
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

      const client = new PgpmMigrate(opts.pg as PgConfig);
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
    opts: PgpmOptions,
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
        extensions = await this.resolveWorkspaceExtensionDependencies();
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
              const client = new PgpmMigrate(opts.pg as PgConfig);
            
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

      const client = new PgpmMigrate(opts.pg as PgConfig);
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
    
    const planPath = path.join(modulePath, 'pgpm.plan');
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
    const planPath = path.join(modPath, 'pgpm.plan');
    if (!exists(planPath)) issues.push({ code: 'missing_plan', message: 'Missing pgpm.plan', file: planPath });
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
        if (pkgName && pkgName !== info.extname) issues.push({ code: 'plan_project_mismatch', message: `pgpm.plan %project ${pkgName} != ${info.extname}`, file: planPath });
        const uri = parsed.data?.uri;
        if (uri && uri !== info.extname) issues.push({ code: 'plan_uri_mismatch', message: `pgpm.plan %uri ${uri} != ${info.extname}`, file: planPath });
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
    const planPath = path.join(modPath, 'pgpm.plan');
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
        warnings.push(`failed to update pgpm.plan`);
      }
    } else {
      warnings.push('missing pgpm.plan');
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
}
