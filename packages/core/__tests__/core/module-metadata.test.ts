import fs from 'fs';
import path from 'path';

import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';

it('writes module metadata files without modifying fixture', async () => {
  const fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
  const dst = fixture.tempFixtureDir;

  const project = new PgpmPackage(dst);

  expect(() =>
    project.setModuleDependencies(['plpgsql', 'uuid-ossp', 'airpage', 'launchql', 'cosmology'])
  ).not.toThrow();

  const controlFile = fs.readFileSync(
    path.join(dst, `${project.getModuleName()}.control`),
    'utf8'
  );
  const makefile = fs.readFileSync(path.join(dst, 'Makefile'), 'utf8');

  expect(controlFile).toContain(
    "requires = 'plpgsql,uuid-ossp,airpage,launchql,cosmology'"
  );
  expect(makefile).toContain('EXTENSION = secrets');

  fixture.cleanup();
});

it('throws error when module depends on itself', async () => {
  const fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
  const dst = fixture.tempFixtureDir;
  const project = new PgpmPackage(dst);

  expect(() =>
    project.setModuleDependencies(['plpgsql', 'secrets', 'uuid-ossp'])
  ).toThrow('Circular reference detected: secrets → secrets');

  fixture.cleanup();
});

it('throws error with specific circular dependency example from issue', async () => {
  const fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
  const dst = fixture.tempFixtureDir;
  const project = new PgpmPackage(dst);

  expect(() =>
    project.setModuleDependencies(['some-native-module', 'secrets'])
  ).toThrow('Circular reference detected: secrets → secrets');

  fixture.cleanup();
});

it('allows valid dependencies without circular references', async () => {
  const fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
  const dst = fixture.tempFixtureDir;
  const project = new PgpmPackage(dst);

  expect(() =>
    project.setModuleDependencies(['plpgsql', 'uuid-ossp', 'other-module'])
  ).not.toThrow();

  fixture.cleanup();
});
