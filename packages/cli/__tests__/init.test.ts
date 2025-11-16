import { LaunchQLPackage } from '@launchql/core';
import { existsSync } from 'fs';
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
      expect(existsSync(path.join(workspaceDir, 'pgpm.json'))).toBe(true);
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
      expect(existsSync(path.join(moduleDir, 'pgpm.plan'))).toBe(true);
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

  describe('init from packages/ folder', () => {
    it('initializes module from packages/ folder (empty workspace)', async () => {
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      const wsName = 'ws-packages-empty';
      const wsRoot = path.join(fixture.tempDir, wsName);

      await commands({
        _: ['init'],
        cwd: fixture.tempDir,
        name: wsName,
        workspace: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const packagesDir = path.join(wsRoot, 'packages');
      const modName = 'mod-from-packages-empty';

      await commands({
        _: ['init'],
        cwd: packagesDir,
        MODULENAME: modName,
        name: modName,
        extensions: ['plpgsql'],
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const modDir = path.join(packagesDir, modName);
      expect(existsSync(modDir)).toBe(true);
      expect(existsSync(path.join(modDir, 'pgpm.plan'))).toBe(true);
      expect(existsSync(path.join(modDir, 'package.json'))).toBe(true);
    });

    it('initializes module from packages/ folder (with existing modules)', async () => {
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      const wsName = 'ws-packages-existing';
      const wsRoot = path.join(fixture.tempDir, wsName);

      await commands({
        _: ['init'],
        cwd: fixture.tempDir,
        name: wsName,
        workspace: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const firstMod = 'first-mod';
      await commands({
        _: ['init'],
        cwd: wsRoot,
        MODULENAME: firstMod,
        name: firstMod,
        extensions: ['plpgsql']
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const packagesDir = path.join(wsRoot, 'packages');
      const secondMod = 'second-mod';

      await commands({
        _: ['init'],
        cwd: packagesDir,
        MODULENAME: secondMod,
        name: secondMod,
        extensions: ['plpgsql'],
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const secondModDir = path.join(packagesDir, secondMod);
      expect(existsSync(secondModDir)).toBe(true);
      expect(existsSync(path.join(secondModDir, 'pgpm.plan'))).toBe(true);
      expect(existsSync(path.join(secondModDir, 'package.json'))).toBe(true);
    });
  });

  describe('prevent nested module creation', () => {
    it('prevents nested module creation inside existing module', async () => {
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      const wsName = 'ws-nested-prevent';
      const wsRoot = path.join(fixture.tempDir, wsName);

      await commands({
        _: ['init'],
        cwd: fixture.tempDir,
        name: wsName,
        workspace: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const baseMod = 'base-mod';
      await commands({
        _: ['init'],
        cwd: wsRoot,
        MODULENAME: baseMod,
        name: baseMod,
        extensions: ['plpgsql']
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const insideDir = path.join(wsRoot, 'packages', baseMod);
      const nestedName = 'nested-mod';

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
        throw new Error(`PROCESS_EXIT:${code}`);
      }) as any);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(commands({
        _: ['init'],
        cwd: insideDir,
        MODULENAME: nestedName,
        name: nestedName,
        extensions: ['plpgsql'],
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      })).rejects.toThrow(/PROCESS_EXIT:1/);

      expect(errorSpy).toHaveBeenCalled();
      const errorCalls = errorSpy.mock.calls.map(call => call.join(' '));
      const hasNestedError = errorCalls.some(call => call.includes('Cannot create a module inside an existing module'));
      expect(hasNestedError).toBe(true);

      const nestedDir = path.join(insideDir, nestedName);
      expect(existsSync(nestedDir)).toBe(false);

      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('workspace root behavior', () => {
    it('initializes module from workspace root (existing behavior)', async () => {
      const { mockInput, mockOutput } = environment;
      const prompter = new Inquirerer({
        input: mockInput,
        output: mockOutput,
        noTty: true
      });

      const wsName = 'ws-root-test';
      const wsRoot = path.join(fixture.tempDir, wsName);

      await commands({
        _: ['init'],
        cwd: fixture.tempDir,
        name: wsName,
        workspace: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const modName = 'mod-from-root';
      await commands({
        _: ['init'],
        cwd: wsRoot,
        MODULENAME: modName,
        name: modName,
        extensions: ['plpgsql']
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });

      const modDir = path.join(wsRoot, 'packages', modName);
      expect(existsSync(modDir)).toBe(true);
      expect(existsSync(path.join(modDir, 'pgpm.plan'))).toBe(true);
      expect(existsSync(path.join(modDir, 'package.json'))).toBe(true);
    });
  });
});

