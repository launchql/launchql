jest.setTimeout(60000);
process.env.PGPM_SKIP_UPDATE_CHECK = 'true';

import { PgpmPackage } from '@pgpmjs/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import { TestFixture } from '../test-utils';

describe('cmds:install - with initialized workspace and module', () => {
  let fixture: TestFixture;
  let workspaceDir: string;
  let moduleDir: string;

  beforeEach(async () => {
    fixture = new TestFixture();

    const workspaceName = 'my-workspace';
    const moduleName = 'my-module';
    workspaceDir = path.join(fixture.tempDir, workspaceName);
    moduleDir = path.join(workspaceDir, 'packages', moduleName);

    // Step 1: Create workspace
    await fixture.runCmd({
      _: ['init', 'workspace'],
      cwd: fixture.tempDir,
      name: workspaceName,
      workspace: true,
    });

    // Step 2: Add module
    await fixture.runCmd({
      _: ['init'],
      cwd: workspaceDir,
      name: moduleName,
      moduleName: moduleName,
      extensions: ['uuid-ossp', 'plpgsql'],
    });
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('installs a module package', async () => {
    const pkg = '@pgpm-testing/base32';
    const version = '1.0.0';

    await fixture.runCmd({
      _: ['install', `${pkg}@${version}`],
      cwd: moduleDir,
    });

    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(moduleDir, 'package.json'), 'utf-8')
    );
    expect(pkgJson).toMatchSnapshot();

    const installedFiles = glob.sync('**/*', {
      cwd: path.join(workspaceDir, 'extensions'),
      dot: true,
      nodir: true,
      absolute: true,
    });

    const relativeFiles = installedFiles
      .map((f: string) => path.relative(moduleDir, f))
      .sort();

    expect(relativeFiles).toMatchSnapshot();

    // Snapshot control file
    const mod = new PgpmPackage(moduleDir);
    const controlFile = mod.getModuleControlFile();
    expect(controlFile).toMatchSnapshot();
  });

  it('installs two modules', async () => {
    const base32 = {
      name: '@pgpm-testing/base32',
      version: '1.0.0',
    };

    const utils = {
      name: '@pgpm-testing/utils',
      version: '1.0.0',
    };

    const pkgs = [base32, utils];

    for (const { name, version } of pkgs) {
      await fixture.runCmd({
        _: ['install', `${name}@${version}`],
        cwd: moduleDir,
      });
    }

    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(moduleDir, 'package.json'), 'utf-8')
    );
    expect(pkgJson).toMatchSnapshot();

    const extPath = path.join(workspaceDir, 'extensions');
    const installedFiles = glob.sync('**/*', {
      cwd: extPath,
      dot: true,
      nodir: true,
      absolute: true,
    });

    
    const relativeFiles = installedFiles
    .map((f: string) => path.relative(moduleDir, f))
    .sort();
    
    expect(relativeFiles).toMatchSnapshot();

    // Snapshot control file after both installs
    const mod = new PgpmPackage(moduleDir);
    const controlFile = mod.getModuleControlFile();
    expect(controlFile).toMatchSnapshot();
  });
});
