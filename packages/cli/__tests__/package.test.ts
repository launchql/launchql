import { PgpmPackage } from '@pgpmjs/core';
import * as fs from 'fs';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as os from 'os';
import * as path from 'path';

import { commands } from '../src/commands';
import { setupTests, TestEnvironment } from '../test-utils';

const fixture = (name: string) =>
  path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', name);

const beforeEachSetup = setupTests();

describe('cmds:package', () => {
  let environment: TestEnvironment;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
  });

  afterAll(() => {
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

  it('updates module with `extension` and `package` commands in copied fixture workspace', async () => {
    const fixtureWorkspace = fixture('launchql');
    const workspacePath = path.join(tempDir, 'launchql');
    fs.cpSync(fixtureWorkspace, workspacePath, { recursive: true });

    const modulePath = path.join(workspacePath, 'packages', 'secrets');
    const initialProject = new PgpmPackage(modulePath);

    // Snapshot initial state
    expect(initialProject.getModuleControlFile()).toMatchSnapshot('initial - control file');
    expect(initialProject.getModuleDependencies('secrets')).toMatchSnapshot('initial - module dependencies');
    expect(initialProject.getRequiredModules()).toMatchSnapshot('initial - required modules');

    // Run extension update
    await runCommand({
      _: ['extension'],
      cwd: modulePath,
      extensions: ['plpgsql', 'module-c']
    });

    // Remove stale SQL to trigger regeneration
    const { sqlFile } = initialProject.getModuleInfo();
    fs.rmSync(path.join(modulePath, sqlFile));

    // Rebuild SQL package
    await runCommand({
      _: ['package'],
      cwd: modulePath
    });

    // Snapshot generated SQL
    const sql = fs.readFileSync(path.join(modulePath, sqlFile), 'utf-8');
    expect(sql).toMatchSnapshot('extension-update - sql');

    // Snapshot resulting file structure
    const relativeFiles = glob('**/*', {
      cwd: modulePath,
      dot: true,
      nodir: true
    }).map(file => path.relative(modulePath, path.resolve(modulePath, file)));

    expect(relativeFiles).toMatchSnapshot('extension-update - files');
  });
});
