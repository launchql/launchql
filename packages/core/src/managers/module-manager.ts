import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import { Logger } from '@launchql/logger';
import { ConfigManager } from './config-manager';
import {
  listModules,
  latestChange,
  latestChangeAndVersion,
  getExtensionsAndModules,
  getExtensionsAndModulesChanges,
  ModuleMap
} from '../modules';
import { getDeps } from '../deps';
import { LaunchQL } from '../class/launchql-refactored';

export interface ModuleInfo {
  name: string;
  path: string;
  dependencies?: string[];
  extensions?: string[];
}

export class ModuleManager {
  private logger = new Logger('launchql:modules');
  private _moduleMap?: ModuleMap;

  constructor(
    private configManager: ConfigManager
  ) {}

  clearCache(): void {
    this._moduleMap = undefined;
  }

  getModuleMap(): ModuleMap {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) return {};

    if (this._moduleMap) return this._moduleMap;

    this._moduleMap = listModules(workspacePath);
    return this._moduleMap;
  }

  getAvailableModules(): LaunchQL[] {
    const workspacePath = this.configManager.getWorkspacePath();
    const config = this.configManager.getConfig();
    if (!workspacePath || !config) return [];

    const modules: LaunchQL[] = [];
    const dirs = config.directories || [];

    for (const dir of dirs) {
      const proj = new LaunchQL(path.join(workspacePath, dir));
      if (proj.isInModule()) {
        modules.push(proj);
      }
    }

    return modules;
  }

  getModuleName(): string {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    return path.basename(modulePath);
  }

  getModuleDependencies(): string[] {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const moduleName = this.getModuleName();
    
    const deps = getDeps(modulePath, moduleName);
    return [...deps.resolved, ...deps.external];
  }

  getModuleDependencyChanges(): string[] {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const workspacePath = this.configManager.getWorkspacePath()!;
    const moduleName = this.getModuleName();
    
    const deps = getDeps(modulePath, moduleName);
    const changes: string[] = [];

    // Get changes from resolved dependencies
    deps.resolved.forEach(depName => {
      const moduleMap = this.getModuleMap();
      if (moduleMap[depName]) {
        const depChanges = getExtensionsAndModulesChanges(
          depName,
          moduleMap,
          workspacePath
        );
        // Collect native extensions and sqitch modules
        changes.push(...depChanges.native);
        depChanges.sqitch.forEach(mod => {
          changes.push(`${mod.name}:${mod.latest}`);
        });
      }
    });

    return [...new Set(changes)];
  }

  getLatestChange(): string | undefined {
    this.configManager.ensureModule();
    const workspacePath = this.configManager.getWorkspacePath()!;
    const moduleName = this.getModuleName();
    const moduleMap = this.getModuleMap();
    
    try {
      return latestChange(moduleName, moduleMap, workspacePath);
    } catch {
      return undefined;
    }
  }

  getLatestChangeAndVersion(): { change: string; version: string } | undefined {
    this.configManager.ensureModule();
    const workspacePath = this.configManager.getWorkspacePath()!;
    const moduleName = this.getModuleName();
    const moduleMap = this.getModuleMap();
    
    try {
      return latestChangeAndVersion(moduleName, moduleMap, workspacePath);
    } catch {
      return undefined;
    }
  }

  getModulePlan(): string {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const planPath = path.join(modulePath, 'sqitch.plan');
    
    if (!fs.existsSync(planPath)) {
      return '';
    }
    
    return fs.readFileSync(planPath, 'utf8');
  }

  getModuleSQL(): string[] {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const deployPath = path.join(modulePath, 'deploy');
    
    if (!fs.existsSync(deployPath)) {
      return [];
    }

    const files = glob.sync('*.sql', { cwd: deployPath });
    return files.map(f => path.basename(f, '.sql'));
  }

  getModuleControlFile(): any {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const controlPath = path.join(modulePath, `${this.getModuleName()}.control`);
    
    if (!fs.existsSync(controlPath)) {
      return null;
    }
    
    const content = fs.readFileSync(controlPath, 'utf8');
    const control: any = {};
    
    content.split('\n').forEach(line => {
      const match = line.match(/^(\w+)\s*=\s*'?([^']+)'?$/);
      if (match) {
        control[match[1]] = match[2];
      }
    });
    
    return control;
  }

  getModuleMakefile(): string | null {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const makefilePath = path.join(modulePath, 'Makefile');
    
    if (!fs.existsSync(makefilePath)) {
      return null;
    }
    
    return fs.readFileSync(makefilePath, 'utf8');
  }

  normalizeChangeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  }

  private createModuleDirectory(modName: string): string {
    const workspacePath = this.configManager.getWorkspacePath();
    const cwd = this.configManager.getCwd();
    const isRoot = workspacePath === cwd;

    if (isRoot) {
      const modPath = path.join(workspacePath!, 'packages', 'deploy', modName);
      fs.mkdirSync(modPath, { recursive: true });
      return modPath;
    } else {
      if (!this.configManager.isInsideAllowedDirs(cwd)) {
        throw new Error(
          `Current directory is not inside allowed directories: ${cwd}`
        );
      }
      const modPath = path.join(cwd, modName);
      fs.mkdirSync(modPath, { recursive: true });
      return modPath;
    }
  }

  async initModule(name: string): Promise<string> {
    this.configManager.ensureWorkspace();
    const modulePath = this.createModuleDirectory(name);
    
    // Initialize sqitch in the module
    await this.initModuleSqitch(modulePath);
    
    return modulePath;
  }

  private async initModuleSqitch(modulePath: string): Promise<void> {
    // This will be replaced with native implementation
    // For now, keeping the structure
    const dirs = ['deploy', 'revert', 'verify'];
    for (const dir of dirs) {
      fs.mkdirSync(path.join(modulePath, dir), { recursive: true });
    }
    
    // Create sqitch.conf
    const sqitchConf = `[core]
	engine = pg
	plan_file = sqitch.plan
[engine "pg"]
	target = db:pg:
`;
    fs.writeFileSync(path.join(modulePath, 'sqitch.conf'), sqitchConf);
    
    // Create empty sqitch.plan
    fs.writeFileSync(path.join(modulePath, 'sqitch.plan'), '%syntax-version=1.0.0\n%project=\n\n');
  }
}