import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { Logger } from '@launchql/logger';
import { ConfigManager } from './config-manager';
import { ModuleManager } from './module-manager';
import {
  getExtensionInfo,
  writeExtensions as writeExtensionsUtil,
  getExtensionName,
  getAvailableExtensions,
  getInstalledExtensions,
  ExtensionInfo,
} from '../extensions';
import { extDeps } from '../deps';
import { parse } from 'parse-package-name';

const rename = promisify(fs.rename);

export class ExtensionManager {
  private logger = new Logger('launchql:extensions');
  private _moduleInfo?: ExtensionInfo;

  constructor(
    private configManager: ConfigManager,
    private moduleManager: ModuleManager
  ) {}

  clearCache(): void {
    this._moduleInfo = undefined;
  }

  getModuleInfo(): ExtensionInfo {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) return {} as ExtensionInfo;

    if (this._moduleInfo) return this._moduleInfo;

    this._moduleInfo = getExtensionInfo(workspacePath);
    return this._moduleInfo;
  }

  getModuleExtensions(): string[] {
    this.configManager.ensureModule();
    const moduleName = this.moduleManager.getModuleName();
    const moduleMap = this.moduleManager.getModuleMap();
    
    const extensions = extDeps(moduleName, moduleMap);
    return [...extensions.resolved, ...extensions.external];
  }

  getAvailableExtensions(): string[] {
    const moduleMap = this.moduleManager.getModuleMap();
    return getAvailableExtensions(moduleMap);
  }

  getInstalledExtensions(): string[] {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) return [];
    
    return getInstalledExtensions(workspacePath);
  }

  async installExtension(packageSpec: string): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) {
      throw new Error('Not in a workspace');
    }

    // Validate package name
    const parsed = parse(packageSpec);
    if (!parsed.name) {
      throw new Error(`Invalid package specification: ${packageSpec}`);
    }

    // Install package safely using spawn instead of execSync
    await this.installPackage(packageSpec, path.join(workspacePath, 'extensions'));

    // Move to correct location if needed
    const installedPath = path.join(workspacePath, 'extensions', 'node_modules', parsed.name);
    const targetPath = path.join(workspacePath, 'extensions', getExtensionName(parsed.name));

    if (fs.existsSync(installedPath) && !fs.existsSync(targetPath)) {
      await rename(installedPath, targetPath);
    }
  }

  private async installPackage(packageSpec: string, prefix: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['install', packageSpec, '--production', '--prefix', prefix];
      
      this.logger.info(`Installing package: ${packageSpec}`);
      
      const proc = spawn('npm', args, {
        cwd: this.configManager.getWorkspacePath(),
        stdio: 'inherit'
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          this.logger.success(`Successfully installed: ${packageSpec}`);
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
      
      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn npm: ${err.message}`));
      });
    });
  }

  async writeExtensions(): Promise<void> {
    this.configManager.ensureModule();
    const workspacePath = this.configManager.getWorkspacePath()!;
    const extensions = this.getModuleExtensions();
    
    await writeExtensionsUtil(workspacePath, extensions);
  }

  getExtensionDependencies(extensionName: string): string[] {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) return [];

    const extensionPath = path.join(workspacePath, 'extensions', extensionName);
    if (!fs.existsSync(extensionPath)) return [];

    const controlFile = path.join(extensionPath, `${extensionName}.control`);
    if (!fs.existsSync(controlFile)) return [];

    const content = fs.readFileSync(controlFile, 'utf8');
    const requiresMatch = content.match(/requires\s*=\s*'([^']+)'/);
    
    if (requiresMatch) {
      return requiresMatch[1].split(',').map(dep => dep.trim());
    }

    return [];
  }

  isExtensionInstalled(name: string): boolean {
    const installed = this.getInstalledExtensions();
    return installed.includes(name);
  }

  getExtensionVersion(name: string): string | null {
    const workspacePath = this.configManager.getWorkspacePath();
    if (!workspacePath) return null;

    const extensionPath = path.join(workspacePath, 'extensions', name);
    const controlFile = path.join(extensionPath, `${name}.control`);
    
    if (!fs.existsSync(controlFile)) return null;

    const content = fs.readFileSync(controlFile, 'utf8');
    const versionMatch = content.match(/default_version\s*=\s*'([^']+)'/);
    
    return versionMatch ? versionMatch[1] : null;
  }
}