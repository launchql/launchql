import { Logger } from '@launchql/logger';
import {
  ConfigManager,
  ModuleManager,
  ExtensionManager,
  PackageManager,
  PlanGenerator
} from '../managers';

export enum ProjectContext {
  Workspace = 'workspace',
  Module = 'module',
  Unknown = 'unknown'
}

/**
 * Refactored LaunchQL class using manager pattern
 * This class serves as a facade to the various managers
 */
export class LaunchQL {
  private logger = new Logger('launchql');
  private configManager: ConfigManager;
  private moduleManager: ModuleManager;
  private extensionManager: ExtensionManager;
  private packageManager: PackageManager;
  private planGenerator: PlanGenerator;

  constructor(cwd: string = process.cwd()) {
    // Initialize managers
    this.configManager = new ConfigManager(cwd);
    this.moduleManager = new ModuleManager(this.configManager);
    this.extensionManager = new ExtensionManager(this.configManager, this.moduleManager);
    this.packageManager = new PackageManager(
      this.configManager,
      this.moduleManager,
      this.extensionManager
    );
    this.planGenerator = new PlanGenerator(
      this.configManager,
      this.moduleManager,
      this.extensionManager
    );
  }

  // Delegate to ConfigManager
  resetCwd(cwd: string): void {
    this.configManager.resetCwd(cwd);
  }

  isInsideAllowedDirs(cwd: string): boolean {
    return this.configManager.isInsideAllowedDirs(cwd);
  }

  ensureModule(): void {
    this.configManager.ensureModule();
  }

  ensureWorkspace(): void {
    this.configManager.ensureWorkspace();
  }

  getContext(): ProjectContext {
    if (this.configManager.isInModule() && this.configManager.isInWorkspace()) {
      return ProjectContext.Module;
    }
    if (this.configManager.isInWorkspace()) return ProjectContext.Workspace;
    return ProjectContext.Unknown;
  }

  isInWorkspace(): boolean {
    return this.configManager.isInWorkspace();
  }

  isInModule(): boolean {
    return this.configManager.isInModule();
  }

  getWorkspacePath(): string | undefined {
    return this.configManager.getWorkspacePath();
  }

  getModulePath(): string | undefined {
    return this.configManager.getModulePath();
  }

  get cwd(): string {
    return this.configManager.getCwd();
  }

  get workspacePath(): string | undefined {
    return this.configManager.getWorkspacePath();
  }

  get modulePath(): string | undefined {
    return this.configManager.getModulePath();
  }

  get config(): any {
    return this.configManager.getConfig();
  }

  get allowedDirs(): string[] {
    return this.configManager.getAllowedDirs();
  }

  // Delegate to ModuleManager
  clearCache(): void {
    this.moduleManager.clearCache();
    this.extensionManager.clearCache();
  }

  getAvailableModules(): LaunchQL[] {
    return this.moduleManager.getAvailableModules();
  }

  getModuleMap(): any {
    return this.moduleManager.getModuleMap();
  }

  getModuleName(): string {
    return this.moduleManager.getModuleName();
  }

  getModuleDependencies(): string[] {
    return this.moduleManager.getModuleDependencies();
  }

  getModuleDependencyChanges(): string[] {
    return this.moduleManager.getModuleDependencyChanges();
  }

  getLatestChange(): string | undefined {
    return this.moduleManager.getLatestChange();
  }

  getLatestChangeAndVersion(): any {
    return this.moduleManager.getLatestChangeAndVersion();
  }

  getModulePlan(): string {
    return this.moduleManager.getModulePlan();
  }

  getModuleSQL(): string[] {
    return this.moduleManager.getModuleSQL();
  }

  getModuleControlFile(): any {
    return this.moduleManager.getModuleControlFile();
  }

  getModuleMakefile(): string | null {
    return this.moduleManager.getModuleMakefile();
  }

  normalizeChangeName(name: string): string {
    return this.moduleManager.normalizeChangeName(name);
  }

  async initModule(name: string): Promise<string> {
    return this.moduleManager.initModule(name);
  }

  // Delegate to ExtensionManager
  getModuleInfo(): any {
    return this.extensionManager.getModuleInfo();
  }

  getModuleExtensions(): string[] {
    return this.extensionManager.getModuleExtensions();
  }

  getAvailableExtensions(): string[] {
    return this.extensionManager.getAvailableExtensions();
  }

  getInstalledExtensions(): string[] {
    return this.extensionManager.getInstalledExtensions();
  }

  async installExtension(packageSpec: string): Promise<void> {
    return this.extensionManager.installExtension(packageSpec);
  }

  async writeExtensions(): Promise<void> {
    return this.extensionManager.writeExtensions();
  }

  // Delegate to PackageManager
  async publishToDist(): Promise<void> {
    return this.packageManager.publishToDist();
  }

  setModuleDependencies(dependencies: string[]): void {
    this.packageManager.setModuleDependencies(dependencies);
  }

  getRequiredModules(): string[] {
    return this.packageManager.getRequiredModules();
  }

  // Delegate to PlanGenerator
  generatePlanFromFiles(): string {
    return this.planGenerator.generatePlanFromFiles();
  }

  writeModulePlan(): void {
    this.planGenerator.writeModulePlan();
  }

  addChangeToProject(name: string, dependencies?: string[]): void {
    this.planGenerator.addChangeToProject(name, dependencies);
  }

  validatePlanConsistency(): { valid: boolean; errors: string[] } {
    return this.planGenerator.validatePlanConsistency();
  }

  // Convenience methods that combine multiple managers
  async install(packages: string[]): Promise<void> {
    for (const pkg of packages) {
      await this.installExtension(pkg);
    }
  }

  async deploy(): Promise<void> {
    // Validate plan first
    const validation = this.validatePlanConsistency();
    if (!validation.valid) {
      throw new Error(`Invalid plan: ${validation.errors.join(', ')}`);
    }

    // Deploy logic would go here
    this.logger.info('Deploy functionality to be implemented');
  }

  async revert(target?: string): Promise<void> {
    // Revert logic would go here
    this.logger.info('Revert functionality to be implemented');
  }

  async verify(): Promise<void> {
    // Verify logic would go here
    this.logger.info('Verify functionality to be implemented');
  }

  async status(): Promise<any> {
    // Status logic would go here
    return {
      workspace: this.getWorkspacePath(),
      module: this.getModulePath(),
      context: this.getContext(),
      modules: this.getAvailableModules().map(m => m.getModuleName()),
      extensions: this.getInstalledExtensions()
    };
  }
}