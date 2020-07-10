import { publish } from '../src/lib/publish';

import * as shell from 'shelljs';
const TMPDIR = process.env.TMPDIR;
import { random } from '../src/lib/random';
import { resolve as pr } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { sync as glob } from 'glob';
import { sync as rimraf } from 'rimraf';
import { writeFileSync } from 'fs';

describe('publish', () => {
  let dir, projDir;
  beforeEach(async () => {
    dir = pr(TMPDIR + '/' + random());
    shell.cp('-r', __dirname + '/../__fixtures__/publish', dir);
    process.env.SKITCH_PATH = dir;
    process.env.SQITCH_PATH = dir + '/packages/secrets';
    process.chdir(dir);
  });
  it('publish an extension', async () => {
    const filesBefore = glob(dir + '/**')
      .map((f) => f.replace(dir, '').replace(/^\//, ''))
      .filter((i) => i);
    expect(filesBefore).toMatchSnapshot();

    await publish('secrets', 'minor');

    const filesAfter = glob(dir + '/**')
      .map((f) => f.replace(dir, '').replace(/^\//, ''))
      .filter((i) => i);
    expect(filesAfter).toMatchSnapshot();
  });
});
