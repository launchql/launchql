import { LaunchQLPackage } from '@launchql/core';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';
import { existsSync } from 'fs';

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

    const result = await commands(argv, prompter, {
      noTty: true,
      input: mockInput,
      output: mockOutput,
      version: '1.0.0',
      minimistOpts: {}
    });

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

    const lql = new LaunchQLPackage(moduleDir);
    expect(lql.getModuleControlFile()).toMatchSnapshot();
  });

  describe('with custom templates', () => {
    it('initializes workspace with --template-path', async () => {
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      const argv: ParsedArgs = {
        _: ['init'],
        cwd: fixture.tempDir,
        name: 'test-workspace-template',
        workspace: true,
        templatePath: path.join(__dirname, '../../../boilerplates'),
      };

      await commands(argv, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const workspaceDir = path.join(fixture.tempDir, 'test-workspace-template');
      expect(existsSync(workspaceDir)).toBe(true);
      expect(existsSync(path.join(workspaceDir, 'package.json'))).toBe(true);
      expect(existsSync(path.join(workspaceDir, 'launchql.json'))).toBe(true);
    });

    it('initializes module with --template-path', async () => {
      // First create a workspace
      const workspaceDir = path.join(fixture.tempDir, 'test-workspace-for-module');
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      // Create workspace first
      await commands({
        _: ['init'],
        cwd: fixture.tempDir,
        name: 'test-workspace-for-module',
        workspace: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      // Now initialize module with custom template
      await commands({
        _: ['init'],
        cwd: workspaceDir,
        name: 'test-module-template',
        MODULENAME: 'test-module-template',
        extensions: ['plpgsql'],
        templatePath: path.join(__dirname, '../../../boilerplates'),
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const moduleDir = path.join(workspaceDir, 'packages', 'test-module-template');
      expect(existsSync(moduleDir)).toBe(true);
      expect(existsSync(path.join(moduleDir, 'package.json'))).toBe(true);
      expect(existsSync(path.join(moduleDir, 'launchql.plan'))).toBe(true);
    });

    // Skip GitHub tests in CI unless network access is explicitly allowed
    const shouldSkipGitHubTests = process.env.CI === 'true' && !process.env.ALLOW_NETWORK_TESTS;

    (shouldSkipGitHubTests ? it.skip : it)(
      'initializes workspace with --repo',
      async () => {
        const { mockInput, mockOutput } = environment;
        const prompter = new Inquirerer({
          input: mockInput,
          output: mockOutput,
          noTty: true
        });

        const argv: ParsedArgs = {
          _: ['init'],
          cwd: fixture.tempDir,
          name: 'test-workspace-repo',
          workspace: true,
          repo: 'launchql/launchql',
        };

        await commands(argv, prompter, {
          noTty: true,
          input: mockInput,
          output: mockOutput,
          version: '1.0.0',
          minimistOpts: {}
        });

        const workspaceDir = path.join(fixture.tempDir, 'test-workspace-repo');
        expect(existsSync(workspaceDir)).toBe(true);
        expect(existsSync(path.join(workspaceDir, 'package.json'))).toBe(true);
      },
      60000 // Increase timeout for network operations
    );

    (shouldSkipGitHubTests ? it.skip : it)(
      'initializes workspace with --repo and --from-branch',
      async () => {
        const { mockInput, mockOutput } = environment;
        const prompter = new Inquirerer({
          input: mockInput,
          output: mockOutput,
          noTty: true
        });

        const argv: ParsedArgs = {
          _: ['init'],
          cwd: fixture.tempDir,
          name: 'test-workspace-branch',
          workspace: true,
          repo: 'launchql/launchql',
          fromBranch: 'main',
        };

        await commands(argv, prompter, {
          noTty: true,
          input: mockInput,
          output: mockOutput,
          version: '1.0.0',
          minimistOpts: {}
        });

        const workspaceDir = path.join(fixture.tempDir, 'test-workspace-branch');
        expect(existsSync(workspaceDir)).toBe(true);
        expect(existsSync(path.join(workspaceDir, 'package.json'))).toBe(true);
      },
      60000
    );
  });
});

