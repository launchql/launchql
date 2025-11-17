import fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import os from 'os';
import path from 'path';

import { commands } from '../src/commands';
import { setupTests,TestEnvironment } from './cli';

const { mkdtempSync, rmSync, cpSync } = fs;

const DEFAULT_AUTHOR_NAME = 'CI Test User';
const DEFAULT_AUTHOR_EMAIL = 'ci@example.com';
const DEFAULT_GITHUB_USERNAME = 'ci-user';
const DEFAULT_LICENSE = 'MIT';
const DEFAULT_ACCESS = 'restricted';

function getDefaultWorkspaceAnswers(argv: ParsedArgs) {
  const moduleName = argv.MODULENAME ?? 'my-module';
  return {
    USERFULLNAME: DEFAULT_AUTHOR_NAME,
    USEREMAIL: DEFAULT_AUTHOR_EMAIL,
    MODULENAME: moduleName,
    USERNAME: DEFAULT_GITHUB_USERNAME,
    LICENSE: DEFAULT_LICENSE
  };
}

function getDefaultModuleAnswers(argv: ParsedArgs) {
  const moduleName = argv.MODULENAME ?? argv.name ?? 'my-module';
  return {
    USERFULLNAME: DEFAULT_AUTHOR_NAME,
    USEREMAIL: DEFAULT_AUTHOR_EMAIL,
    MODULENAME: moduleName,
    MODULEDESC: argv.MODULEDESC ?? `${moduleName} description`,
    REPONAME: argv.REPONAME ?? `${moduleName}-repo`,
    USERNAME: DEFAULT_GITHUB_USERNAME,
    ACCESS: argv.ACCESS ?? DEFAULT_ACCESS,
    LICENSE: argv.LICENSE ?? DEFAULT_LICENSE
  };
}

export function withInitDefaults(argv: ParsedArgs): ParsedArgs {
  if (!argv?._?.includes('init')) {
    return argv;
  }

  if (argv.workspace) {
    const defaults = getDefaultWorkspaceAnswers(argv);
    const moduleName = defaults.MODULENAME;
    return { ...defaults, ...argv, MODULENAME: moduleName };
  }

  const moduleDefaults = getDefaultModuleAnswers(argv);
  const moduleName = moduleDefaults.MODULENAME;
  return { ...moduleDefaults, ...argv, MODULENAME: moduleName };
}

export const FIXTURES_PATH = path.resolve(__dirname, '../../../__fixtures__');

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
    argv = withInitDefaults(argv);
    const {
      mockInput,
      mockOutput,
      writeResults,
      transformResults
    } = this.environment;

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
