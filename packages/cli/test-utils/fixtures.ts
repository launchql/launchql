import fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import os from 'os';
import path from 'path';

import { commands } from '../src/commands';
import { setupTests,TestEnvironment } from './cli';

const { mkdtempSync, rmSync, cpSync } = fs;

export const FIXTURES_PATH = path.resolve(__dirname, '../../../__fixtures__');
const DEFAULT_REPO = 'https://github.com/launchql/pgpm-boilerplates.git';

export const getFixturePath = (...paths: string[]) =>
  path.join(FIXTURES_PATH, ...paths);

export class TestFixture {
  readonly tempDir: string;
  readonly tempFixtureDir: string;
  readonly getFixturePath: (...paths: string[]) => string;
  private environment: TestEnvironment;

  constructor(...fixturePath: string[]) {
    this.tempDir = mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));

    if (fixturePath.length > 0) {
      const originalFixtureDir = getFixturePath(...fixturePath);
      this.tempFixtureDir = path.join(this.tempDir, ...fixturePath);
      cpSync(originalFixtureDir, this.tempFixtureDir, { recursive: true });
    } else {
      this.tempFixtureDir = this.tempDir;
    }

    this.getFixturePath = (...paths: string[]) =>
      path.join(this.tempFixtureDir, ...paths);

    this.environment = setupTests()();
  }

  fixturePath(...paths: string[]) {
    return path.join(this.tempFixtureDir, ...paths);
  }

  cleanup() {
    rmSync(this.tempDir, { recursive: true, force: true });
  }

  async runCmd(argv: ParsedArgs) {
    const {
      mockInput,
      mockOutput,
      writeResults,
      transformResults
    } = this.environment;

    // Default to local templates to avoid network and keep tests fast
    const hasInitCommand = Array.isArray(argv._) && argv._.includes('init');
    if (hasInitCommand) {
      argv.repo = argv.repo ?? DEFAULT_REPO;
      argv.templatePath = argv.templatePath ?? (argv.workspace ? 'workspace' : 'module');
      const defaults = {
        fullName: 'Tester',
        email: 'tester@example.com',
        moduleName: argv.workspace ? 'starter-module' : argv.name || argv.moduleName || 'module',
        username: 'tester',
        repoName: (argv.name as string) || (argv.moduleName as string) || 'repo-name',
        license: 'MIT',
        access: 'public',
        packageIdentifier: (argv.name as string) || (argv.moduleName as string) || 'module',
        moduleDesc: (argv.name as string) || (argv.moduleName as string) || 'module'
      };
      Object.assign(argv, defaults, argv);
    }

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

    return {
      result,
      argv,
      writeResults,
      transformResults
    };
  }
}
