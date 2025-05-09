import { install, installPackage } from '../src/lib/install';
import { init, initSkitch } from '../src/lib/init';
import { sync as mkdirp } from 'mkdirp';
import { sync as glob } from 'glob';
import { sync as rimraf } from 'rimraf';
import { writeFileSync } from 'fs';

const TMPDIR = process.env.TMPDIR;
const rnd = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

describe('installs', () => {
  let dir, projDir;
  beforeEach(async () => {
    dir = TMPDIR + '/' + rnd();
    projDir = dir + '/myproject';
    mkdirp(projDir);
    process.chdir(dir);
    await initSkitch();
    process.chdir(projDir);
    await init({
      name: 'myproject',
      description: 'my amazing project',
      author: 'dan@example.com',
      extensions: ['plpgsql', 'citext']
    });
  });
  afterEach(() => {
    rimraf(dir);
  });
  describe('skitch path', () => {
    it('sqitch install', async () => {
      const files = glob('**');
      expect(files).toMatchSnapshot();
      process.chdir(dir);
      writeFileSync(
        `${dir}/package.json`,
        JSON.stringify(
          {
            name: 'blankpackage'
          },
          null,
          2
        )
      );
      await installPackage('skitch-extension-verify', 'latest');
      const filesAfter = glob('**');
      expect(filesAfter).toMatchSnapshot();
    });
  });
});
