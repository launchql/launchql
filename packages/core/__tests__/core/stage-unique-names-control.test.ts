import fs from 'fs';
import path from 'path';

import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';

describe('stage fixture control/metadata generation (unique-names)', () => {
  let fixture: TestFixture;
  let dst: string;
  let project: PgpmPackage;

  beforeAll(() => {
    fixture = new TestFixture('stage');
    dst = fixture.tempFixtureDir;
    project = new PgpmPackage(dst);
  });

  afterAll(() => {
    fixture.cleanup();
  });

  it('writes control file and Makefile for unique-names without modifying source fixture', async () => {
    const moduleProject = fixture.getModuleProject([], 'unique-names');

    expect(() =>
      moduleProject.setModuleDependencies(['plpgsql'])
    ).not.toThrow();

    const moduleDir = path.join(fixture.tempFixtureDir, 'packages', 'unique-names');
    const controlFilePath = path.join(
      moduleDir,
      `${moduleProject.getModuleName()}.control`
    );
    const makefilePath = path.join(moduleDir, 'Makefile');

    const controlFile = fs.readFileSync(controlFilePath, 'utf8');
    const makefile = fs.readFileSync(makefilePath, 'utf8');

    expect(controlFile).toContain(`requires = 'plpgsql'`);
    expect(controlFile).toContain(`module_pathname = '$libdir/${moduleProject.getModuleName()}'`);
    expect(makefile).toContain(`EXTENSION = ${moduleProject.getModuleName()}`);
  });
});
