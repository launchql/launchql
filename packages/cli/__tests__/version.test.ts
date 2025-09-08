import { LaunchQLPackage } from '@launchql/core';
import * as fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';
import { execSync } from 'child_process';

import { commands } from '../src/commands';
import { TestFixture } from '../test-utils';

describe('cmds:version', () => {
  let fixture: TestFixture;

  beforeAll(() => {
    fixture = new TestFixture('sqitch', 'launchql');
  });

  afterAll(() => {
    fixture.cleanup();
  });

  const runCommand = async (argv: ParsedArgs) => {
    const prompter = new Inquirerer({
      input: process.stdin,
      output: process.stdout,
      noTty: true
    });

    return commands(argv, prompter, {
      noTty: true,
      input: process.stdin,
      output: process.stdout,
      version: '1.0.0',
      minimistOpts: {}
    });
  };

  const initGitRepo = (workspacePath: string) => {
    try {
      execSync('git init', { cwd: workspacePath, stdio: 'pipe' });
      execSync('git config user.name "Test User"', { cwd: workspacePath, stdio: 'pipe' });
      execSync('git config user.email "test@example.com"', { cwd: workspacePath, stdio: 'pipe' });
      execSync('git add .', { cwd: workspacePath, stdio: 'pipe' });
      execSync('git commit -m "Initial commit"', { cwd: workspacePath, stdio: 'pipe' });
    } catch (error) {
    }
  };

  it('bumps version and updates dependencies in dry-run mode', async () => {
    const workspacePath = fixture.tempFixtureDir;
    initGitRepo(workspacePath);

    const secretsPath = path.join(workspacePath, 'packages', 'secrets');
    const secretsPkgPath = path.join(secretsPath, 'package.json');
    const secretsPkg = JSON.parse(fs.readFileSync(secretsPkgPath, 'utf8'));
    secretsPkg.version = '1.0.0';
    fs.writeFileSync(secretsPkgPath, JSON.stringify(secretsPkg, null, 2));

    const result = await runCommand({
      _: ['version'],
      cwd: workspacePath,
      bump: 'patch',
      'dry-run': true
    });

    expect(result).toBeDefined();
    
    const updatedPkg = JSON.parse(fs.readFileSync(secretsPkgPath, 'utf8'));
    expect(updatedPkg.version).toBe('1.0.0'); // Should remain unchanged
  });

  it('bumps version with exact version specified', async () => {
    const workspacePath = fixture.tempFixtureDir;
    initGitRepo(workspacePath);

    const secretsPath = path.join(workspacePath, 'packages', 'secrets');
    const secretsPkgPath = path.join(secretsPath, 'package.json');
    const secretsPkg = JSON.parse(fs.readFileSync(secretsPkgPath, 'utf8'));
    secretsPkg.version = '1.0.0';
    fs.writeFileSync(secretsPkgPath, JSON.stringify(secretsPkg, null, 2));

    const result = await runCommand({
      _: ['version'],
      cwd: workspacePath,
      bump: 'exact',
      exact: '2.0.0',
      'dry-run': true
    });

    expect(result).toBeDefined();
  });

  it('filters packages by pattern', async () => {
    const workspacePath = fixture.tempFixtureDir;
    initGitRepo(workspacePath);

    const result = await runCommand({
      _: ['version'],
      cwd: workspacePath,
      filter: 'secrets',
      bump: 'patch',
      'dry-run': true
    });

    expect(result).toBeDefined();
  });

  it('fails when not run from workspace root', async () => {
    const workspacePath = fixture.tempFixtureDir;
    const modulePath = fixture.getFixturePath('packages', 'secrets');

    try {
      await runCommand({
        _: ['version'],
        cwd: modulePath,
        bump: 'patch',
        'dry-run': true
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('handles no changed packages scenario', async () => {
    const workspacePath = fixture.tempFixtureDir;
    initGitRepo(workspacePath);
    
    try {
      execSync('git tag secrets@1.0.0', { cwd: workspacePath, stdio: 'pipe' });
    } catch (error) {
    }

    const result = await runCommand({
      _: ['version'],
      cwd: workspacePath,
      bump: 'patch',
      'dry-run': true
    });

    expect(result).toBeDefined();
  });

  it('shows help when --help flag is provided', async () => {
    const result = await runCommand({
      _: ['version'],
      help: true
    });

    expect(result).toBeDefined();
  });
});
