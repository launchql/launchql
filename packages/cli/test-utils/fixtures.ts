import fs from 'fs';
import os from 'os';
import path from 'path';
import { sync as glob } from 'glob';
import { Inquirerer } from 'inquirerer';
import { commands } from '../src/commands';
import { ParsedArgs } from 'minimist';
import { TestEnvironment, setupTests } from './cli';

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

    const prompter = new Inquirerer({
      input: mockInput,
      output: mockOutput,
      noTty: true
    });

    // @ts-ignore
    const result = await commands(argv, prompter, {});

    return {
      result,
      argv,
      writeResults,
      transformResults
    };
  }
}
