import { LaunchQLPackage } from '@launchql/core';
import { sync as glob } from 'glob';
import * as path from 'path';

import { TestFixture } from '../test-utils';

jest.setTimeout(600000);

describe('cmds:extension', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    // Use existing sqitch/simple fixture to avoid expensive init scaffolding
    fixture = new TestFixture('sqitch', 'simple');
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('runs `extension` command after workspace and module setup', async () => {
    const modulePath = fixture.getFixturePath('packages', 'my-first');

    // Snapshot initial state
    const initialProject = new LaunchQLPackage(modulePath);
    expect(initialProject.getModuleControlFile()).toMatchSnapshot('initial - control file');
    expect(initialProject.getModuleDependencies('my-first')).toMatchSnapshot('initial - module dependencies');
    expect(initialProject.getRequiredModules()).toMatchSnapshot('initial - required modules');

    // Run extension command to update dependencies
    const { result: extensionResult } = await fixture.runCmd({
      _: ['extension'],
      cwd: modulePath,
      extensions: ['plpgsql', 'module-c']
    });

    // Clean `cwd` for stable snapshot
    (extensionResult as any).cwd = '<CWD>';

    const allFiles = glob('**/*', {
      cwd: modulePath,
      dot: true,
      nodir: true,
      absolute: true
    });

    const relativeFiles = allFiles.map(file => path.relative(modulePath, file));

    expect(extensionResult).toMatchSnapshot('extension-update - result');
    expect(relativeFiles).toMatchSnapshot('extension-update - files');

    // Validate updated state
    const updatedProject = new LaunchQLPackage(modulePath);
    expect(updatedProject.getModuleControlFile()).toMatchSnapshot('updated - control file');
    expect(updatedProject.getModuleDependencies('my-first')).toMatchSnapshot('updated - module dependencies');
    expect(updatedProject.getRequiredModules()).toMatchSnapshot('updated - required modules');
  });
});
