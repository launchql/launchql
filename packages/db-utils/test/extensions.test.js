import {
  getAvailableExtensions,
  getInstalledExtensions,
  writeExtensions,
  getExtensionInfo
} from '../src/lib/extensions';
import { sync as rimraf } from 'rimraf';
import { sync as mkdirp } from 'mkdirp';
import { init, initSkitch } from '../src/lib/init';
import { readFileSync } from 'fs';

const TMPDIR = process.env.TMPDIR;
const rnd = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

describe('extensions', () => {
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
  describe('skitch extensions', () => {
    it('list', async () => {
      const avail = await getAvailableExtensions();
      const installed = await getInstalledExtensions();
      expect(avail).toEqual([
        'plpgsql',
        'uuid-ossp',
        'pgcrypto',
        'plv8',
        'myproject'
      ]);
      expect(installed).toEqual(['plpgsql', 'citext']);
    });
    it('write', async () => {
      await writeExtensions(['plpgsql', 'uuid-ossp', 'pgcrypto', 'plv8']);
      const installed = await getInstalledExtensions();
      expect(installed).toEqual(['plpgsql', 'uuid-ossp', 'pgcrypto', 'plv8']);
      const info = await getExtensionInfo();
      expect(readFileSync(info.controlFile).toString()).toMatchSnapshot();
    });
  });
});
