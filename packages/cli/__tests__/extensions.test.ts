import { Inquirerer, InquirererOptions } from 'inquirerer';
import { setupTests, TestEnvironment } from '../test-utils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { sync as glob } from 'glob';
import { commands } from '../src/commands';
import { ParsedArgs } from 'minimist';
import { LaunchQLProject } from '@launchql/migrate';

const beforeEachSetup = setupTests();

describe('extension', () => {
  let environment: TestEnvironment;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-init-test-'));
  });

  afterAll(() => {
    // Uncomment to inspect output: console.log(tempDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    environment = beforeEachSetup();
  });

  const runCommand = async (argv: ParsedArgs) => {
    const prompter = new Inquirerer({
      input: environment.mockInput,
      output: environment.mockOutput,
      noTty: true
    });

    // @ts-ignore
    return commands(argv, prompter, {});
  };

  it('runs `extension` command after workspace and module setup', async () => {
    const workspacePath = path.join(tempDir, 'my-workspace');
    const modulePath = path.join(workspacePath, 'packages', 'my-module');

    // Step 1: Initialize workspace
    await runCommand({
      _: ['init'],
      cwd: tempDir,
      name: 'my-workspace',
      workspace: true
    });

    // Step 2: Initialize module inside workspace
    await runCommand({
      _: ['init'],
      cwd: workspacePath,
      name: 'my-module',
      MODULENAME: 'my-module',
      extensions: ['mod-1', 'mod2']
    });

    // Step 2b: Snapshot initial control file and module dependencies
    const initialProject = new LaunchQLProject(modulePath);

    expect(initialProject.getModuleControlFile()).toMatchSnapshot('initial - control file');
    expect(initialProject.getModuleDependencies('my-module')).toMatchSnapshot('initial - module dependencies');
    expect(initialProject.getRequiredModules()).toMatchSnapshot('initial - required modules');

    // Step 3: Run `extension` command to update module
    const extensionResult = await runCommand({
      _: ['extension'],
      cwd: modulePath,
      extensions: ['plpgsql', 'module-c']
    });

    // Clean `cwd` for stable snapshot
    extensionResult.cwd = '<CWD>';

    const allFiles = glob('**/*', {
      cwd: modulePath,
      dot: true,
      nodir: true,
      absolute: true
    });

    const relativeFiles = allFiles.map(file => path.relative(modulePath, file));

    expect(extensionResult).toMatchSnapshot('extension-update - result');
    expect(relativeFiles).toMatchSnapshot('extension-update - files');

    // Step 4: Re-init project and validate changes
    const updatedProject = new LaunchQLProject(modulePath);

    expect(updatedProject.getModuleControlFile()).toMatchSnapshot('updated - control file');
    expect(updatedProject.getModuleDependencies('my-module')).toMatchSnapshot('updated - module dependencies');
    expect(updatedProject.getRequiredModules()).toMatchSnapshot('updated - required modules');
  });
});
