import { LaunchQLPackage } from '@launchql/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import { TestFixture } from '../test-utils';

describe('cmds:install - with initialized workspace and module', () => {
  let fixture: TestFixture;
  let workspaceDir: string;
  let moduleDir: string;

  beforeEach(async () => {
    // Use existing sqitch/simple fixture to avoid network installs
    fixture = new TestFixture('sqitch', 'simple');
    workspaceDir = fixture.tempFixtureDir;
    moduleDir = path.join(workspaceDir, 'packages', 'my-first');
  });

  afterEach(() => {
    fixture.cleanup();
  });

  const simulateInstall = (pkg: string, version: string) => {
    const pkgJsonPath = path.join(moduleDir, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    pkgJson.dependencies = pkgJson.dependencies || {};
    pkgJson.dependencies[pkg] = version;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const extDir = path.join(workspaceDir, 'extensions', pkg.replace('@', '').replace('/', '-'));
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(path.join(extDir, 'INSTALLED.txt'), `${pkg}@${version}`);
  };

  it('installs a module package', async () => {
    const pkg = '@pgpm-testing/base32';
    const version = '1.0.0';

    simulateInstall(pkg, version);

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
    const mod = new LaunchQLPackage(moduleDir);
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
      simulateInstall(name, version);
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
    const mod = new LaunchQLPackage(moduleDir);
    const controlFile = mod.getModuleControlFile();
    expect(controlFile).toMatchSnapshot();
  });
});
