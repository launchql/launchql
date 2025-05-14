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

describe('init', () => {
  let environment: TestEnvironment;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-init-test-'));
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    environment = beforeEachSetup();
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
        cwd: tempDir,
        name: 'my-workspace',
        workspace: true
      },
      'workspace'
    );
  });

  it('initialize module', async () => {
    const workspaceDir = path.join(tempDir, 'my-workspace');
    const moduleDir = path.join(workspaceDir, 'packages', 'my-module');

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
    await lql.init();

    expect(lql.getModuleControlFile()).toMatchSnapshot();
  });

});
