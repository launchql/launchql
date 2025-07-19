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

  parseScript(script: string): Array<{ command: string; args: ParsedArgs }> {
    return script
      .trim()
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => {
        const parts = line.trim().split(/\s+/);
        const [, command, ...argParts] = parts; // Skip 'lql'
        
        const args: ParsedArgs = {
          _: [command],
          cwd: this.tempFixtureDir,
          recursive: true,
          yes: true, // Auto-confirm prompts
          tx: true,  // Use transactions
          fast: false // Don't use fast deployment
        };

        for (let i = 0; i < argParts.length; i++) {
          const arg = argParts[i];
          if (arg.startsWith('--')) {
            const key = arg.slice(2);
            
            if (key.startsWith('no-')) {
              const booleanKey = key.slice(3); // Remove 'no-' prefix
              args[booleanKey] = false;
            } else if (i + 1 < argParts.length && !argParts[i + 1].startsWith('--')) {
              args[key] = argParts[++i];
            } else {
              args[key] = true;
            }
          }
        }

        return { command, args };
      });
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

  async getSnapshottableResults(commands: Array<{ command: string; args: ParsedArgs }>) {
    const results: Array<{ command: string; args: ParsedArgs & { cwd: string }; success: boolean }> = [];
    for (const { command, args } of commands) {
      const result = await this.runCmd(args);
      results.push({
        command,
        args: { ...args, cwd: '<CWD>' }, // Normalize cwd for snapshot
        success: result.result !== null && result.result !== undefined
      });
    }
    return results;
  }
}
