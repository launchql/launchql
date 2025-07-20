import { LaunchQLProject } from '@launchql/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import { TestFixture } from '../test-utils';

function getExpectedFiles(pkg: string, version: string): string[] {
  const parts = pkg.split('/');
  const isScoped = pkg.startsWith('@');
  const scope = isScoped ? parts[0].slice(1) : null;
  const name = isScoped ? parts[1] : parts[0];

  const basePath = isScoped
    ? `../../extensions/@${scope}/${name}`
    : `../../extensions/${name}`;

  const extname = isScoped ? `${scope}-${name}` : name;

  return [
    `${basePath}/package.json`,
    `${basePath}/launchql.plan`,
    `${basePath}/Makefile`,
    `${basePath}/sql/${extname}--${version}.sql`,
    `${basePath}/${extname}.control`,
    `${basePath}/deploy/`,
    `${basePath}/revert/`,
    `${basePath}/verify/`
  ].map((f) =>
    expect.stringMatching(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  );
}

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
      _: ['init'],
      cwd: fixture.tempDir,
      name: workspaceName,
      workspace: true
    });

    // Step 2: Add module
    await fixture.runCmd({
      _: ['init'],
      cwd: workspaceDir,
      name: moduleName,
      MODULENAME: moduleName,
      extensions: ['uuid-ossp', 'plpgsql']
    });
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('installs a module package', async () => {
    const pkg = '@webql/base32';
    const version = '1.2.1';

    await fixture.runCmd({
      _: ['install', `${pkg}@${version}`],
      cwd: moduleDir
    });

    const pkgJson = JSON.parse(fs.readFileSync(path.join(moduleDir, 'package.json'), 'utf-8'));
    expect(pkgJson).toMatchSnapshot();

    const installedFiles = glob.sync('**/*', {
      cwd: path.join(workspaceDir, 'extensions'),
      dot: true,
      nodir: true,
      absolute: true
    });

    const relativeFiles = installedFiles.map(f => path.relative(moduleDir, f));
    expect(relativeFiles).toMatchSnapshot();
    expect(relativeFiles).toEqual(expect.arrayContaining(getExpectedFiles(pkg, version)));

    // Snapshot control file
    const mod = new LaunchQLProject(moduleDir);
    const controlFile = mod.getModuleControlFile();
    expect(controlFile).toMatchSnapshot();
  });

  it('installs two modules', async () => {
    const base32 = {
      name: '@webql/base32',
      version: '1.2.1'
    };

    const utils = {
      name: '@webql/utils',
      version: '1.1.2'
    };

    const pkgs = [base32, utils];

    for (const { name, version } of pkgs) {
      await fixture.runCmd({
        _: ['install', `${name}@${version}`],
        cwd: moduleDir
      });
    }

    const pkgJson = JSON.parse(fs.readFileSync(path.join(moduleDir, 'package.json'), 'utf-8'));
    expect(pkgJson).toMatchSnapshot();

    const extPath = path.join(workspaceDir, 'extensions');
    const installedFiles = glob.sync('**/*', {
      cwd: extPath,
      dot: true,
      nodir: true,
      absolute: true
    });

    const relativeFiles = installedFiles.map(f => path.relative(moduleDir, f));

    for (const pkg of pkgs) {
      expect(relativeFiles).toEqual(expect.arrayContaining(getExpectedFiles(pkg.name, pkg.version)));
    }

    // Snapshot control file after both installs
    const mod = new LaunchQLProject(moduleDir);
    const controlFile = mod.getModuleControlFile();
    expect(controlFile).toMatchSnapshot();
  });
});
