import fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import os from 'os';
import path from 'path';
import { DEFAULT_TEMPLATE_REPO } from '@pgpmjs/core';

import { commands } from '../src/commands';
import { setupTests, TestEnvironment } from './cli';
import { withInitDefaults } from './init-argv';

const { mkdtempSync, rmSync, cpSync } = fs;

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
    const {
      mockInput,
      mockOutput,
      writeResults,
      transformResults
    } = this.environment;

    // Default to remote templates and deterministic identity answers for init
    // flows so tests are stable and do not rely on local machine config.
    argv = withInitDefaults(argv, DEFAULT_TEMPLATE_REPO);

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
