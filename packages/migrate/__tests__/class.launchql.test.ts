import path from 'path';
import { LaunchQLProject, ProjectContext } from '../src/class/launchql';

const fixture = (name: string) =>
  path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', name);

describe('LaunchQLProject', () => {
  it('detects workspace root context correctly', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);

    expect(project.getContext()).toBe(ProjectContext.Workspace);
    expect(project.isInWorkspace()).toBe(true);
    expect(project.isInModule()).toBe(false);
  });

  it('detects module inside workspace correctly', async () => {
    const cwd = path.join(fixture('launchql'), 'packages', 'secrets');
    const project = new LaunchQLProject(cwd);

    expect(project.getContext()).toBe(ProjectContext.ModuleInsideWorkspace);
    expect(project.isInWorkspace()).toBe(false);
    expect(project.isInModule()).toBe(true);
  });

  it('detects standalone module context', async () => {
    const cwd = path.join(fixture('resolve'), 'basic');
    const project = new LaunchQLProject(cwd);

    expect(project.getContext()).toBe(ProjectContext.Module);
    expect(project.isInModule()).toBe(true);
    expect(project.isInWorkspace()).toBe(false);
  });

  it('returns modules within workspace', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);

    const modules = await project.getModules();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
    modules.forEach(mod => {
      expect(mod.isInModule()).toBe(true);
    });
  });

  it('resolves module name from sqitch plan', async () => {
    const cwd = path.join(fixture('launchql'), 'packages', 'secrets');
    const project = new LaunchQLProject(cwd);

    const name = project.getModuleName();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('resolves module info with version and paths', async () => {
    const cwd = path.join(fixture('launchql'), 'packages', 'secrets');
    const project = new LaunchQLProject(cwd);

    const info = project.getModuleInfo();
    expect(info.extname).toBeTruthy();
    expect(info.version).toMatch(/\d+\.\d+\.\d+/);
    expect(info.controlFile).toContain('.control');
    expect(info.Makefile).toContain('Makefile');
  });

  it('gets required modules from control file', async () => {
    const cwd = path.join(fixture('launchql'), 'packages', 'secrets');
    const project = new LaunchQLProject(cwd);

    const deps = project.getRequiredModules();
    expect(Array.isArray(deps)).toBe(true);
    expect(deps).toContain('plpgsql');
  });

  it('gets latest change and version for a workspace module', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);

    const modules = project.getModuleMap();
    const modName = Object.keys(modules)[0];
    const { change, version } = project.getLatestChangeAndVersion(modName);

    expect(typeof change).toBe('string');
    expect(change.length).toBeGreaterThan(0);
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });

  it('gets native and internal module dependencies', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);

    const modules = project.getModuleMap();
    const modName = Object.keys(modules)[0];

    const { native, modules: deps } = project.getModuleDependencies(modName);
    expect(native).toBeDefined();
    expect(deps).toBeDefined();
  });

  it('clears internal caches correctly', async () => {
    const cwd = path.join(fixture('launchql'), 'packages', 'secrets');
    const project = new LaunchQLProject(cwd);

    const firstCall = project.getModuleInfo();
    project.clearCache();
    const secondCall = project.getModuleInfo();

    expect(firstCall).not.toBe(secondCall);
  });

  it('throws on module info if not in module', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);

    expect(() => project.getModuleInfo()).toThrow('Not inside a module');
  });

  it('gets latest change only from sqitch plan', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);
    const modules = project.getModuleMap();
    const name = Object.keys(modules)[0];
    const change = project.getLatestChange(name);
    expect(typeof change).toBe('string');
    expect(change.length).toBeGreaterThan(0);
  });

  it('gets dependency changes with versions for internal modules', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);
    const name = Object.keys(project.getModuleMap())[0];
    const result = await project.getModuleDependencyChanges(name);
    expect(result).toHaveProperty('native');
    expect(result).toHaveProperty('modules');
    expect(Array.isArray(result.modules)).toBe(true);
  });

  it('returns a list of available modules in workspace', async () => {
    const cwd = fixture('launchql');
    const project = new LaunchQLProject(cwd);
    const modules = project.getAvailableModules();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
  });
  

});
