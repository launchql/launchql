import path from 'path';
import { LaunchQLProject } from '../src/class/launchql';

const fixture = (p: string[]) =>
  path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', ...p);

const getModuleProject = (wrksps: string, name: string): LaunchQLProject => {
  const workspace = new LaunchQLProject(fixture([wrksps]));

  const moduleMap = workspace.getModuleMap();
  const meta = moduleMap[name];
  if (!meta) throw new Error(`Module ${name} not found in workspace`);

  const modPath = fixture([wrksps, meta.path]);
  const mod = new LaunchQLProject(modPath);
  return mod;
};

  it('getModuleExtensions', async () => {
    expect(
        getModuleProject('simple', 'my-first')
            .getModuleExtensions()
    ).toMatchSnapshot();
  });
  
  it('getModuleExtensions 2nd', async () => {
    expect(
        getModuleProject('simple', 'my-second')
            .getModuleExtensions()
    ).toMatchSnapshot();
  });
  
  it('getModuleExtensions 3rd', async () => {
    expect(
        getModuleProject('simple', 'my-third')
            .getModuleExtensions()
    ).toMatchSnapshot();
  });
  
  it('getModuleExtensions 3rd', async () => {
    const mod = getModuleProject('simple', 'my-third');
    console.log(mod.getAvailableModules());
    console.log(mod.getModuleMap());
    console.log(mod.getModuleExtensions());
    expect(
        mod
            .getModuleDependencies('my-third')
    ).toMatchSnapshot();
  });
  