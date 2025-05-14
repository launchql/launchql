import fs from 'fs';
import os from 'os';
import path from 'path';
import { LaunchQLProject } from '../src/class/launchql';

const fixture = (name: string) =>
  path.resolve(__dirname, '../../..', '__fixtures__', 'sqitch', name);

it('writes module metadata files without modifying fixture', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
  const src = path.join(fixture('launchql'), 'packages', 'secrets');
  const dst = path.join(tempRoot, 'secrets');

  fs.cpSync(src, dst, { recursive: true }); // copy module to temp dir

  const project = new LaunchQLProject(dst);
  await project.init();

  expect(() =>
    project.setModuleDependencies(['plpgsql', 'uuid-ossp', 'airpage', 'launchql', 'cosmology'])
  ).not.toThrow();

  const controlFile = fs.readFileSync(
    path.join(dst, `${project.getModuleName()}.control`),
    'utf8'
  );
  const makefile = fs.readFileSync(path.join(dst, 'Makefile'), 'utf8');

  expect(controlFile).toContain('requires = \'plpgsql,uuid-ossp,airpage,launchql,cosmology\'');
  expect(makefile).toContain('EXTENSION = secrets');

  fs.rmSync(tempRoot, { recursive: true, force: true }); // cleanup
});
