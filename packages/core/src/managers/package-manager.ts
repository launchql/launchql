import fs from 'fs';
import path from 'path';
import { Logger } from '@launchql/logger';
import { ConfigManager } from './config-manager';
import { ModuleManager } from './module-manager';
import { ExtensionManager } from './extension-manager';

export interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export class PackageManager {
  private logger = new Logger('launchql:packages');

  constructor(
    private configManager: ConfigManager,
    private moduleManager: ModuleManager,
    private extensionManager: ExtensionManager
  ) {}

  async publishToDist(distFolder: string = 'dist'): Promise<void> {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const moduleName = this.moduleManager.getModuleName();
    
    const controlFile = `${moduleName}.control`;
    const fullDist = path.join(modulePath, distFolder);

    // Clean existing dist folder
    if (fs.existsSync(fullDist)) {
      fs.rmSync(fullDist, { recursive: true, force: true });
    }

    // Create dist folder
    fs.mkdirSync(fullDist, { recursive: true });

    // Define what to copy
    const folders = ['deploy', 'revert', 'sql', 'verify'];
    const files = ['Makefile', 'package.json', 'sqitch.conf', 'sqitch.plan', controlFile];

    // Add README file regardless of casing
    const readmeFile = fs.readdirSync(modulePath).find(f => /^readme\.md$/i.test(f));
    if (readmeFile) {
      files.push(readmeFile);
    }

    // Copy folders
    folders.forEach(folder => {
      const src = path.join(modulePath, folder);
      const dest = path.join(fullDist, folder);
      if (fs.existsSync(src)) {
        fs.cpSync(src, dest, { recursive: true });
      }
    });

    // Copy files
    files.forEach(file => {
      const src = path.join(modulePath, file);
      const dest = path.join(fullDist, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });

    this.logger.info(`Published module ${moduleName} to ${distFolder}`);
  }

  getPackageJson(): PackageInfo | null {
    const modulePath = this.configManager.getModulePath();
    if (!modulePath) return null;

    const packageJsonPath = path.join(modulePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return null;

    const content = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
  }

  updatePackageJson(updates: Partial<PackageInfo>): void {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const packageJsonPath = path.join(modulePath, 'package.json');

    let packageJson: PackageInfo;
    if (fs.existsSync(packageJsonPath)) {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    } else {
      packageJson = {
        name: this.moduleManager.getModuleName(),
        version: '1.0.0'
      };
    }

    // Merge updates
    Object.assign(packageJson, updates);

    // Write back
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
  }

  setModuleDependencies(dependencies: string[]): void {
    const packageJson = this.getPackageJson() || {
      name: this.moduleManager.getModuleName(),
      version: '1.0.0'
    };

    // Convert dependency array to object with versions
    const deps: Record<string, string> = {};
    dependencies.forEach(dep => {
      // Check if it's an extension
      if (this.extensionManager.isExtensionInstalled(dep)) {
        const version = this.extensionManager.getExtensionVersion(dep);
        deps[dep] = version || '*';
      } else {
        // It's a module dependency
        deps[dep] = '*';
      }
    });

    this.updatePackageJson({
      dependencies: deps
    });
  }

  getRequiredModules(): string[] {
    const packageJson = this.getPackageJson();
    if (!packageJson?.dependencies) return [];

    return Object.keys(packageJson.dependencies).filter(dep => {
      // Filter out extensions, keep only modules
      return !this.extensionManager.isExtensionInstalled(dep);
    });
  }

  getRequiredExtensions(): string[] {
    const packageJson = this.getPackageJson();
    if (!packageJson?.dependencies) return [];

    return Object.keys(packageJson.dependencies).filter(dep => {
      // Keep only extensions
      return this.extensionManager.isExtensionInstalled(dep);
    });
  }

  validateDependencies(): { valid: boolean; missing: string[] } {
    const required = this.getRequiredModules();
    const available = this.moduleManager.getAvailableModules().map(m => m.getModuleName());
    
    const missing = required.filter(req => !available.includes(req));
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  async createDistribution(): Promise<string> {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const distPath = path.join(modulePath, 'dist');

    // Create dist directory
    fs.mkdirSync(distPath, { recursive: true });

    // Copy necessary files
    const filesToCopy = [
      'sqitch.plan',
      'sqitch.conf',
      'package.json',
      'README.md',
      'LICENSE'
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(modulePath, file);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(distPath, file);
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Copy SQL directories
    const sqlDirs = ['deploy', 'revert', 'verify'];
    for (const dir of sqlDirs) {
      const srcDir = path.join(modulePath, dir);
      const destDir = path.join(distPath, dir);
      if (fs.existsSync(srcDir)) {
        this.copyDirectory(srcDir, destDir);
      }
    }

    return distPath;
  }

  private copyDirectory(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}