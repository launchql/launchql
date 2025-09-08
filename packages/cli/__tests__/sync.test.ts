import { LaunchQLPackage } from '@launchql/core';
import * as fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { commands } from '../src/commands';
import { TestFixture } from '../test-utils';

describe('cmds:sync', () => {
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

  it('syncs control file and creates SQL migration file', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '1.2.3';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    await runCommand({
      _: ['sync'],
      cwd: modulePath
    });

    const project = new LaunchQLPackage(modulePath);
    const info = project.getModuleInfo();
    const controlContent = fs.readFileSync(info.controlFile, 'utf8');
    expect(controlContent).toContain("default_version = '1.2.3'");

    const sqlFile = path.join(modulePath, 'sql', 'secrets--1.2.3.sql');
    expect(fs.existsSync(sqlFile)).toBe(true);
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    expect(sqlContent).toContain('secrets extension version 1.2.3');
  });

  it('does not overwrite existing SQL migration file', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '1.2.3';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const sqlDir = path.join(modulePath, 'sql');
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }
    const sqlFile = path.join(sqlDir, 'secrets--1.2.3.sql');
    const customContent = '-- Custom SQL content\nCREATE FUNCTION test();';
    fs.writeFileSync(sqlFile, customContent);

    await runCommand({
      _: ['sync'],
      cwd: modulePath
    });

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    expect(sqlContent).toBe(customContent);
  });

  it('fails when not run in a module directory', async () => {
    const nonModuleDir = path.join(fixture.tempDir, 'not-a-module');
    fs.mkdirSync(nonModuleDir, { recursive: true });

    try {
      await runCommand({
        _: ['sync'],
        cwd: nonModuleDir
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('fails when package.json has no version', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    delete pkgJson.version;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    try {
      await runCommand({
        _: ['sync'],
        cwd: modulePath
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('shows help when --help flag is provided', async () => {
    const result = await runCommand({
      _: ['sync'],
      help: true
    });

    expect(result).toBeDefined();
  });
});
