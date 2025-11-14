import * as fs from 'fs';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { commands } from '../src/commands';
import { setupTests, TestEnvironment, TestFixture } from '../test-utils';

const beforeEachSetup = setupTests();

describe('cmds:add', () => {
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

  const runAddTest = async (argv: ParsedArgs, label: string) => {
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

  const setupModule = async (moduleDir: string) => {
    fs.mkdirSync(moduleDir, { recursive: true });
    fs.mkdirSync(path.join(moduleDir, 'deploy'), { recursive: true });
    fs.mkdirSync(path.join(moduleDir, 'revert'), { recursive: true });
    fs.mkdirSync(path.join(moduleDir, 'verify'), { recursive: true });
    
    const planContent = `%syntax-version=1.0.0
%project=test-module
%uri=https://github.com/test/test-module

`;
    fs.writeFileSync(path.join(moduleDir, 'launchql.plan'), planContent);
    
    const controlContent = `{
  "name": "test-module",
  "version": "0.1.0",
  "description": "Test module"
}`;
    fs.writeFileSync(path.join(moduleDir, 'launchql.control'), controlContent);
  };

  it('adds simple change', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'organizations'],
        cwd: moduleDir
      },
      'simple-change'
    );

    expect(fs.existsSync(path.join(moduleDir, 'deploy', 'organizations.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'revert', 'organizations.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'verify', 'organizations.sql'))).toBe(true);

    const planContent = fs.readFileSync(path.join(moduleDir, 'launchql.plan'), 'utf8');
    expect(planContent).toContain('organizations');
  });

  it('adds change with note', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-with-note');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'brands'],
        cwd: moduleDir,
        note: 'Adds the brands table'
      },
      'change-with-note'
    );

    const planContent = fs.readFileSync(path.join(moduleDir, 'launchql.plan'), 'utf8');
    expect(planContent).toContain('brands');
    expect(planContent).toContain('Adds the brands table');
  });

  it('adds change with dependencies', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-with-deps');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'users'],
        cwd: moduleDir
      },
      'dependency-change'
    );

    await runAddTest(
      {
        _: ['add', 'contacts'],
        cwd: moduleDir,
        requires: 'users',
        note: 'Adds contacts table'
      },
      'change-with-dependency'
    );

    const planContent = fs.readFileSync(path.join(moduleDir, 'launchql.plan'), 'utf8');
    expect(planContent).toContain('users');
    expect(planContent).toContain('contacts');

    const deployContent = fs.readFileSync(path.join(moduleDir, 'deploy', 'contacts.sql'), 'utf8');
    expect(deployContent).toContain('requires: users');
  });

  it('adds nested path change', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-nested');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'api/v1/endpoints'],
        cwd: moduleDir
      },
      'nested-path-change'
    );

    expect(fs.existsSync(path.join(moduleDir, 'deploy', 'api', 'v1', 'endpoints.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'revert', 'api', 'v1', 'endpoints.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'verify', 'api', 'v1', 'endpoints.sql'))).toBe(true);

    const planContent = fs.readFileSync(path.join(moduleDir, 'launchql.plan'), 'utf8');
    expect(planContent).toContain('api/v1/endpoints');
  });

  it('adds deeply nested path change', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-deep-nested');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'schema/myschema/tables/mytable'],
        cwd: moduleDir
      },
      'deeply-nested-path-change'
    );

    expect(fs.existsSync(path.join(moduleDir, 'deploy', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'revert', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);
    expect(fs.existsSync(path.join(moduleDir, 'verify', 'schema', 'myschema', 'tables', 'mytable.sql'))).toBe(true);

    const planContent = fs.readFileSync(path.join(moduleDir, 'launchql.plan'), 'utf8');
    expect(planContent).toContain('schema/myschema/tables/mytable');
  });


  it('shows help when requested', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-help');
    await setupModule(moduleDir);

    const { mockInput, mockOutput } = environment;
    const prompter = new Inquirerer({
      input: mockInput,
      output: mockOutput,
      noTty: true
    });

    const originalExit = process.exit;
    let exitCode: number | undefined;
    process.exit = jest.fn((code?: number) => {
      exitCode = code;
      throw new Error(`process.exit called with code ${code}`);
    }) as any;

    try {
      await commands({
        _: ['add'],
        cwd: moduleDir,
        help: true
      }, prompter, {
        noTty: true,
        input: mockInput,
        output: mockOutput,
        version: '1.0.0',
        minimistOpts: {}
      });
    } catch (error) {
      expect(exitCode).toBe(0);
    } finally {
      process.exit = originalExit;
    }
  });

  it('verifies SQL files do not contain transaction statements', async () => {
    const moduleDir = path.join(fixture.tempDir, 'test-module-no-transactions');
    await setupModule(moduleDir);

    await runAddTest(
      {
        _: ['add', 'no-transactions'],
        cwd: moduleDir
      },
      'no-transaction-statements'
    );

    const deployContent = fs.readFileSync(path.join(moduleDir, 'deploy', 'no-transactions.sql'), 'utf8');
    const revertContent = fs.readFileSync(path.join(moduleDir, 'revert', 'no-transactions.sql'), 'utf8');
    const verifyContent = fs.readFileSync(path.join(moduleDir, 'verify', 'no-transactions.sql'), 'utf8');

    expect(deployContent).not.toContain('BEGIN;');
    expect(deployContent).not.toContain('COMMIT;');
    expect(deployContent).not.toContain('ROLLBACK;');
    
    expect(revertContent).not.toContain('BEGIN;');
    expect(revertContent).not.toContain('COMMIT;');
    expect(revertContent).not.toContain('ROLLBACK;');
    
    expect(verifyContent).not.toContain('BEGIN;');
    expect(verifyContent).not.toContain('COMMIT;');
    expect(verifyContent).not.toContain('ROLLBACK;');
  });
});
