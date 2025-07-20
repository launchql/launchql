import fs from 'fs';
import path from 'path';

import { LaunchQLProject } from '../../src/core/class/launchql';
import { TestFixture } from '../../test-utils';

it('writes module metadata files without modifying fixture', async () => {
  const fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
  const dst = fixture.tempFixtureDir;

  const project = new LaunchQLProject(dst);

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
