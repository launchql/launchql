import fs from 'fs';
import path, { dirname, resolve, join } from 'path';
import * as glob from 'glob';
import { walkUp } from '../../workspace/utils';
import { extDeps, resolveDependencies } from '../../resolution/deps';
import chalk from 'chalk';
import { parse } from 'parse-package-name';
import os from 'os';
import { Logger } from '@launchql/logger';
import { execSync } from 'child_process';
import { generatePlan, writePlan } from '../../files';
import { LaunchQLOptions, errors } from '@launchql/types';
import { PgConfig, getPgEnvOptions } from 'pg-env';
import { getPgPool } from 'pg-cache';
import { LaunchQLMigrate } from '../../migrate/client';
import { packageModule } from '../../packaging/package';

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
} from '../../modules/modules';

import {
  getExtensionInfo,
  writeExtensions,
  getExtensionName,
  getInstalledExtensions,
  ExtensionInfo,
} from '../../files';
import { getAvailableExtensions } from '../../extensions/extensions';


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
      return walkUp(this.cwd, 'launchql.plan');
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

  getModuleProject(name: string): LaunchQLProject {
    this.ensureWorkspace();
    
    if (this.isInModule() && name === this.getModuleName()) {
      return this;
    }
    
    const modules = this.getModuleMap();
    if (!modules[name]) {
      throw new Error(`Module "${name}" does not exist.`);
    }
    
    const modulePath = path.resolve(this.workspacePath!, modules[name].path);
    return new LaunchQLProject(modulePath);
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
    // Create launchql.plan file using project-files package
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

  generateModulePlan(options: { uri?: string; projects?: boolean }): string {
    this.ensureModule();
    const info = this.getModuleInfo();
    const moduleName = info.extname;

    // Get raw dependencies and resolved list
    let { resolved, deps } = resolveDependencies(this.cwd, moduleName, { tagResolution: 'internal' });

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
      const external = depData.modules
        .map((m) => `${m.name}:${m.latest}`);

      // Add external dependencies to the first change if there is one
      if (resolved.length > 0) {
        const firstKey = `/deploy/${resolved[0]}.sql`;
        deps[firstKey] = deps[firstKey] || [];

        // Only add external deps that don't already exist and don't have a tag dependency
        external.forEach(ext => {
          const extModuleName = ext.split(':')[0];
          
          // Check if we already have a tag dependency for this module
          const hasTagDependency = deps[firstKey].some(dep => {
            return dep.startsWith(`${extModuleName}:@`);
          });
          
          // Only add if we don't already have this dependency or a tag dependency for this module
          if (!hasTagDependency && !deps[firstKey].includes(ext)) {
            deps[firstKey].push(ext);
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

    // Use the project-files package to generate the plan
    return generatePlan({
      moduleName,
      uri: options.uri,
      entries
    });
  }

  writeModulePlan(
    options: { uri?: string; projects?: boolean }
  ): void {
    this.ensureModule();
    const name = this.getModuleName();
    const plan = this.generateModulePlan(options);
    const moduleMap = this.getModuleMap();
    const mod = moduleMap[name];
    const planPath = path.join(this.workspacePath!, mod.path, 'launchql.plan');
    
    // Use the project-files package to write the plan
    writePlan(planPath, plan);
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

  // ──────────────── Project Operations ────────────────

  async deploy(
    opts: LaunchQLOptions,
    name?: string,
    toChange?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('deploy');

    if (!name) {
      const context = this.getContext();
      if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
        name = this.getModuleName();
        recursive = false;
      } else if (context === ProjectContext.Workspace) {
        throw new Error('Module name is required when running from workspace root');
      } else {
        throw new Error('Not in a LaunchQL workspace or module');
      }
    }

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

      log.info(`🔍 Gathering modules from ${this.workspacePath}...`);
      const modules = this.getModuleMap();

      const moduleProject = this.getModuleProject(name);

      log.info(`📦 Resolving dependencies for ${name}...`);
      const extensions = moduleProject.getModuleExtensions();

    const pgPool = getPgPool(opts.pg);

    log.success(`🚀 Starting deployment to database ${opts.pg.database}...`);

    for (const extension of extensions.resolved) {
      try {
        if (extensions.external.includes(extension)) {
          const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
          log.info(`📥 Installing external extension: ${extension}`);
          log.debug(`> ${msg}`);
          await pgPool.query(msg);
        } else {
          const modulePath = resolve(this.workspacePath!, modules[extension].path);
          log.info(`📂 Deploying local module: ${extension}`);
          log.debug(`→ Path: ${modulePath}`);

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

            log.debug(`→ Deploy: ${opts.pg.database}`);
            log.debug(`> ${pkg.sql}`);

            await pgPool.query(pkg.sql);

            if (opts.deployment.cache) {
              deployFastCache[cacheKey] = pkg;
            }
          } else {
            log.debug(`→ Migrate: ${opts.pg.database}`);
            
            try {
              const client = new LaunchQLMigrate(opts.pg as PgConfig);
              
              const result = await client.deploy({
                modulePath,
                toChange,
                useTransaction: opts.deployment.useTx
              });
              
              if (result.failed) {
                throw new Error(`Deployment failed at change: ${result.failed}`);
              }
            } catch (deployError) {
              log.error(`❌ Deployment failed for module ${extension}`);
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

      log.success(`✅ Deployment complete for ${name}.`);
    } else {
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw new Error(`Could not resolve module path for ${name}`);
      }

      log.info(`📂 Deploying single module: ${name}`);
      log.debug(`→ Path: ${modulePath}`);

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.deploy({
        modulePath,
        toChange,
        useTransaction: opts.deployment?.useTx
      });

      if (result.failed) {
        throw new Error(`Deployment failed at change: ${result.failed}`);
      }

      log.success(`✅ Single module deployment complete for ${name}.`);
    }
  }

  async revert(
    opts: LaunchQLOptions,
    name?: string,
    toChange?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('revert');

    if (!name) {
      const context = this.getContext();
      if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
        name = this.getModuleName();
        recursive = false;
      } else if (context === ProjectContext.Workspace) {
        throw new Error('Module name is required when running from workspace root');
      } else {
        throw new Error('Not in a LaunchQL workspace or module');
      }
    }

    if (recursive) {
      log.info(`🔍 Gathering modules from ${this.workspacePath}...`);
      const modules = this.getModuleMap();

      const moduleProject = this.getModuleProject(name);

      log.info(`📦 Resolving dependencies for ${name}...`);
      const extensions = moduleProject.getModuleExtensions();

    const pgPool = getPgPool(opts.pg);

    log.success(`🧹 Starting revert process on database ${opts.pg.database}...`);

    const reversedExtensions = [...extensions.resolved].reverse();

    for (const extension of reversedExtensions) {
      try {
        if (extensions.external.includes(extension)) {
          const msg = `DROP EXTENSION IF EXISTS "${extension}" RESTRICT;`;
          log.warn(`⚠️ Dropping external extension: ${extension}`);
          log.debug(`> ${msg}`);
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
          log.debug(`→ Path: ${modulePath}`);

          log.debug(`→ Command: launchql migrate revert db:pg:${opts.pg.database}`);
          
          try {
            const client = new LaunchQLMigrate(opts.pg as PgConfig);
            
            const result = await client.revert({
              modulePath,
              toChange,
              useTransaction: opts.deployment.useTx
            });
            
            if (result.failed) {
              throw new Error(`Revert failed at change: ${result.failed}`);
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

      log.success(`✅ Revert complete for ${name}.`);
    } else {
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw new Error(`Could not resolve module path for ${name}`);
      }

      log.info(`📂 Reverting single module: ${name}`);
      log.debug(`→ Path: ${modulePath}`);

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.revert({
        modulePath,
        toChange,
        useTransaction: opts.deployment?.useTx
      });

      if (result.failed) {
        throw new Error(`Revert failed at change: ${result.failed}`);
      }

      log.success(`✅ Single module revert complete for ${name}.`);
    }
  }

  async verify(
    opts: LaunchQLOptions,
    name?: string,
    toChange?: string,
    recursive: boolean = true
  ): Promise<void> {
    const log = new Logger('verify');

    if (!name) {
      const context = this.getContext();
      if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
        name = this.getModuleName();
        recursive = false;
      } else if (context === ProjectContext.Workspace) {
        throw new Error('Module name is required when running from workspace root');
      } else {
        throw new Error('Not in a LaunchQL workspace or module');
      }
    }

    if (recursive) {
      log.info(`🔍 Gathering modules from ${this.workspacePath}...`);
      const modules = this.getModuleMap();

      const moduleProject = this.getModuleProject(name);

      log.info(`📦 Resolving dependencies for ${name}...`);
      const extensions = moduleProject.getModuleExtensions();

    const pgPool = getPgPool(opts.pg);

    log.success(`🔎 Verifying deployment of ${name} on database ${opts.pg.database}...`);

    for (const extension of extensions.resolved) {
      try {
        if (extensions.external.includes(extension)) {
          const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
          log.info(`🔍 Verifying external extension: ${extension}`);
          log.debug(`> ${query}`);
          await pgPool.query(query, [extension]);
        } else {
          const modulePath = resolve(this.workspacePath!, modules[extension].path);
          log.info(`📂 Verifying local module: ${extension}`);
          log.debug(`→ Path: ${modulePath}`);
          log.debug(`→ Command: launchql migrate verify db:pg:${opts.pg.database}`);

          try {
            const client = new LaunchQLMigrate(opts.pg as PgConfig);
            
            const result = await client.verify({
              modulePath
            });
            
            if (result.failed.length > 0) {
              throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
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

      log.success(`✅ Verification complete for ${name}.`);
    } else {
      const moduleProject = this.getModuleProject(name);
      const modulePath = moduleProject.getModulePath();
      if (!modulePath) {
        throw new Error(`Could not resolve module path for ${name}`);
      }

      log.info(`📂 Verifying single module: ${name}`);
      log.debug(`→ Path: ${modulePath}`);

      const client = new LaunchQLMigrate(opts.pg as PgConfig);
      const result = await client.verify({
        modulePath
      });

      if (result.failed.length > 0) {
        throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
      }

      log.success(`✅ Single module verification complete for ${name}.`);
    }
  }
}
