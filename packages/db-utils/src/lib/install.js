import { resolve, join, dirname, basename } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { sync as glob } from 'glob';
import { sync as rimraf } from 'rimraf';
import { skitchPath } from './paths';
import { exec } from 'shelljs';
import parse from 'parse-package-name';

const TMPDIR = process.env.TMPDIR;
const rnd = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export const installPackage = async (pkgstr) => {
  const { name, version } = parse(pkgstr);

  const sPath = await skitchPath();
  const cur = process.cwd();

  /*

currently creating a temp dir and treating this as a global skitch ext that any sqitch proj can use...

IMPROVEMENTS:

later maybe you can install in the current dir, and then install everything so that it's actually in the current dir, and then

1. updates the package.json of the sqitch project
2. also the control file of the sqitch project

(leaves skitch project alone, only updates the individual projects)

Questions: how about if you install one that already exists? Do we just leave it there or delete and update?

Note: What about when you create a new sqitch (e.g. lql init) and you choose modules... notice it doesn't yet update the package.json???

*/

  const tmp = join(TMPDIR, rnd());
  mkdirp(tmp);
  process.chdir(tmp);
  exec(`npm install ${name}@${version} --production --prefix ./extensions`);
  const sqitch = glob('./extensions/**/sqitch.conf');
  const cmds = sqitch
    .map((f) => resolve(join(tmp, f)))
    .map((conf) => {
      const extDir = dirname(conf);
      const dir = extDir.split('node_modules/')[1];
      return [extDir, resolve(join(sPath, 'extensions', dir)), dir];
    });

  for (const [src, dst, pkg] of cmds) {
    // sorry not sorry
    rimraf(dst);
    console.log(`installing ${pkg}...`);
    mkdirp(dirname(dst));
    exec(`mv ${src} ${dst}`);
  }

  rimraf(tmp);

  process.chdir(cur);

  console.log(`
  WARNING!
  
  manually add this to package.json to the modules that need it if you plan to publish them
  `);
};
