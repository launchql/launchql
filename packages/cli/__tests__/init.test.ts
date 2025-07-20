import { LaunchQLProject } from '@launchql/core';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { commands } from '../src/commands';
import { setupTests, TestEnvironment, TestFixture } from '../test-utils';

const beforeEachSetup = setupTests();

describe('cmds:init', () => {
  let environment: TestEnvironment;
  let fixture: TestFixture;

  beforeAll(() => {
    fixture = new TestFixture();
  });

  beforeEach(() => {
    environment = beforeEachSetup();
  });

  afterAll(() => {
    fixture.cleanup();
  });

  const runInitTest = async (argv: ParsedArgs, label: string) => {
    const { mockInput, mockOutput, writeResults, transformResults } = environment;

    const prompter = new Inquirerer({
      input: mockInput,
      output: mockOutput,
      noTty: true
    });

    // @ts-ignore
    const result = await commands(argv, prompter, {});

    const absoluteFiles = glob('**/*', {
      cwd: argv.cwd,
      dot: true,
      nodir: true,
      absolute: true
    });

    const relativeFiles = absoluteFiles.map(file => path.relative(argv.cwd, file));
    argv.cwd = '<CWD>';

    expect(argv).toMatchSnapshot(`${label} - argv`);
    expect(result).toMatchSnapshot(`${label} - result`);
    expect(writeResults).toMatchSnapshot(`${label} - writeResults`);
    expect(transformResults).toMatchSnapshot(`${label} - transformResults`);
    expect(relativeFiles).toMatchSnapshot(`${label} - files`);
  };

  it('initializes workspace', async () => {
    await runInitTest(
      {
        _: ['init'],
        cwd: fixture.tempDir,
        name: 'my-workspace',
        workspace: true
      },
      'workspace'
    );
  });

  it('initializes module', async () => {
    const workspaceDir = path.join(fixture.tempDir, 'my-workspace');
    const moduleDir = path.join(workspaceDir, 'packages', 'my-module');
    console.log({workspaceDir, moduleDir});
    await runInitTest(
      {
        _: ['init'],
        cwd: workspaceDir,
        name: 'my-module',
        MODULENAME: 'my-module',
        extensions: ['plpgsql', 'citext']
      },
      'module-only'
    );

    const lql = new LaunchQLProject(moduleDir);
    expect(lql.getModuleControlFile()).toMatchSnapshot();
  });
});
