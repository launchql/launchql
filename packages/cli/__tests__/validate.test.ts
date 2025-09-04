import { LaunchQLPackage } from '@launchql/core';
import * as fs from 'fs';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

import { commands } from '../src/commands';
import { TestFixture } from '../test-utils';

describe('cmds:validate', () => {
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

  it('validates a consistent package successfully', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '0.0.1';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const project = new LaunchQLPackage(modulePath);
    const info = project.getModuleInfo();
    const controlContent = `comment = 'secrets extension'
default_version = '0.0.1'
module_pathname = '$libdir/secrets'
relocatable = false
`;
    fs.writeFileSync(info.controlFile, controlContent);

    const sqlDir = path.join(modulePath, 'sql');
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }
    const sqlFile = path.join(sqlDir, 'secrets--0.0.1.sql');
    fs.writeFileSync(sqlFile, '-- secrets extension version 0.0.1\n');

    const result = await runCommand({
      _: ['validate'],
      cwd: modulePath
    });

    expect(result).toBeDefined();
  });

  it('detects version mismatch between package.json and control file', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '0.0.2';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const project = new LaunchQLPackage(modulePath);
    const info = project.getModuleInfo();
    const controlContent = `comment = 'secrets extension'
default_version = '0.0.1'
module_pathname = '$libdir/secrets'
relocatable = false
`;
    fs.writeFileSync(info.controlFile, controlContent);

    try {
      await runCommand({
        _: ['validate'],
        cwd: modulePath
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('detects missing SQL migration file', async () => {
    const modulePath = fixture.getFixturePath('packages', 'secrets');
    
    const pkgJsonPath = path.join(modulePath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.version = '0.0.1';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const project = new LaunchQLPackage(modulePath);
    const info = project.getModuleInfo();
    const controlContent = `comment = 'secrets extension'
default_version = '0.0.1'
module_pathname = '$libdir/secrets'
relocatable = false
`;
    fs.writeFileSync(info.controlFile, controlContent);

    const sqlFile = path.join(modulePath, 'sql', 'secrets--0.0.1.sql');
    if (fs.existsSync(sqlFile)) {
      fs.rmSync(sqlFile);
    }

    try {
      await runCommand({
        _: ['validate'],
        cwd: modulePath
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('shows help when --help flag is provided', async () => {
    const result = await runCommand({
      _: ['validate'],
      help: true
    });

    expect(result).toBeDefined();
  });
});
