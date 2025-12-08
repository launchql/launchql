jest.setTimeout(60000);
process.env.PGPM_SKIP_UPDATE_CHECK = 'true';

import { LaunchQLPackage } from '@launchql/core';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { commands } from '../src/commands';
import { setupTests, TestEnvironment, TestFixture } from '../test-utils';

const beforeEachSetup = setupTests();
const DEFAULT_REPO = 'https://github.com/launchql/pgpm-boilerplates.git';

describe('cmds:extension', () => {
  let environment: TestEnvironment;
  let fixture: TestFixture;

  beforeEach(() => {
    environment = beforeEachSetup();
    fixture = new TestFixture(); // empty fixture
  });

  afterEach(() => {
    fixture.cleanup();
  });

  const runCommand = async (argv: ParsedArgs) => {
    const prompter = new Inquirerer({
      input: environment.mockInput,
      output: environment.mockOutput,
      noTty: true
    });

    const isInit = Array.isArray(argv._) && argv._.includes('init');
    if (isInit) {
      argv.repo = argv.repo ?? DEFAULT_REPO;
      argv.templatePath = argv.templatePath ?? (argv.workspace ? 'workspace' : 'module');
      const baseName = (argv.moduleName as string) || (argv.name as string) || 'module';
      const defaults = {
        fullName: 'Tester',
        email: 'tester@example.com',
        moduleName: argv.workspace ? 'starter-module' : baseName,
        username: 'tester',
        repoName: baseName,
        license: 'MIT',
        access: 'public',
        packageIdentifier: baseName,
        moduleDesc: baseName
      };
      Object.assign(argv, defaults, argv);
    }

    // @ts-ignore
    return commands(argv, prompter, {});
  };

  it('runs `extension` command after workspace and module setup', async () => {
    const workspacePath = fixture.fixturePath('my-workspace');
    const modulePath = path.join(workspacePath, 'packages', 'my-module');

    // Step 1: Initialize workspace
    await runCommand({
      _: ['init'],
      cwd: fixture.tempDir,
      name: 'my-workspace',
      workspace: true
    });

    // Step 2: Initialize module inside workspace
    await runCommand({
      _: ['init'],
      cwd: workspacePath,
      name: 'my-module',
      moduleName: 'my-module',
      extensions: ['mod-1', 'mod2']
    });

    // Step 2b: Snapshot initial control file and module dependencies
    const initialProject = new LaunchQLPackage(modulePath);

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

    // Step 4: Re-init package and validate changes
    const updatedProject = new LaunchQLPackage(modulePath);

    expect(updatedProject.getModuleControlFile()).toMatchSnapshot('updated - control file');
    expect(updatedProject.getModuleDependencies('my-module')).toMatchSnapshot('updated - module dependencies');
    expect(updatedProject.getRequiredModules()).toMatchSnapshot('updated - required modules');
  });
});
