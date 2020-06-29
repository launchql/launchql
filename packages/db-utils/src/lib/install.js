import { promisify } from 'util';
import { resolve } from 'path';
var mkdirp = require('mkdirp').sync;
import { skitchPath } from './paths';
import { exec } from 'shelljs';

import { writeFileSync } from 'fs';

const TMPDIR = process.env.TMPDIR;
const rnd = () =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

export const install = async () => {
  const sPath = await skitchPath();
  const cur = process.cwd();
  process.chdir(sPath);
  exec(`npm install --production`);
  process.chdir(cur);
};

export const installPackage = async (name, version = 'latest') => {
  const sPath = await skitchPath();
  const cur = process.cwd();
  process.chdir(sPath);
  exec(`npm install ${name}@${version} --production`);
  process.chdir(cur);
};
