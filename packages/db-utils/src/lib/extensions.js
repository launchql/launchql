import { sync as glob } from 'glob';
import { sqitchPath as path } from './paths';
import { listModules } from './modules';
import { writeFileSync, readFileSync } from 'fs';
import { sluggify } from './utils';

export const getAvailableExtensions = async () => {
  let modules = await listModules();
  modules = Object.keys(modules).reduce(
    (m, v) => {
      if (m.includes(v)) return m;
      m.push(v);
      return m;
    },
    ['plpgsql', 'uuid-ossp', 'pgcrypto', 'plv8']
  );
  return modules;
};

export const getExtensionInfo = async packageDir => {
  if (!packageDir) {
    packageDir = await path();
  }
  const pkgPath = `${packageDir}/package.json`;
  const pkg = require(pkgPath);
  const extname = sluggify(pkg.name);
  const version = pkg.version;
  const Makefile = `${packageDir}/Makefile`;
  const controlFile = `${packageDir}/${extname}.control`;
  const sqlFile = `${extname}--${version}.sql`;
  return {
    extname,
    packageDir,
    version,
    Makefile,
    controlFile,
    sqlFile
  };
};

export const getExtensionName = async packageDir => {
  if (!packageDir) {
    packageDir = await path();
  }
  const plan = readFileSync(`${packageDir}/sqitch.plan`)
    .toString()
    .split('\n')
    .map(line => line.trim())
    .filter(l => l)
    .filter(l => /^%project=/.test(l));

  if (!plan.length) {
    throw new Error('no plan name!');
  }

  return plan[0].split('=')[1];
};

export const getInstalledExtensions = async () => {
  const info = await getExtensionInfo();

  let extensions;
  try {
    extensions = readFileSync(info.controlFile)
      .toString()
      .split('\n')
      .find(line => line.match(/^requires/))
      .split('=')[1]
      .split('\'')[1]
      .split(',')
      .map(a => a.trim());
  } catch (e) {
    throw new Error('missing requires from control files or bad syntax');
  }

  return extensions;
};

export const writeExtensionMakefile = async ({ path, extname, version }) => {
  writeFileSync(
    path,
    `EXTENSION = ${extname}
DATA = sql/${extname}--${version}.sql

PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
  `
  );
};

export const writeExtensionControlFile = async ({
  path,
  extname,
  extensions,
  version
}) => {
  writeFileSync(
    path,
    `# ${extname} extension
comment = '${extname} extension'
default_version = '${version}'
module_pathname = '$libdir/${extname}'
requires = '${extensions.join(',')}'
relocatable = false
superuser = false
  `
  );
};

export const writeExtensions = async extensions => {
  const { controlFile: path, extname, version } = await getExtensionInfo();
  await writeExtensionControlFile({ path, extname, extensions, version });
};

export const writeExtensionsToEnv = async () => {
  const sqitchPath = await path();

  const controlFile = glob(`${sqitchPath}/*.control`);
  const envFile = glob(`${sqitchPath}/.env`);
  if (!controlFile || !controlFile.length) {
    throw new Error('no control file found!');
  }
  if (!envFile || !envFile.length) {
    throw new Error('no control file found!');
  }

  let extensions;
  try {
    extensions = readFileSync(controlFile[0])
      .toString()
      .split('\n')
      .find(line => line.match(/^requires/))
      .split('=')[1]
      .split('\'')[1]
      .split(',')
      .map(a => a.trim());
  } catch (e) {
    throw new Error('missing requires from control files or bad syntax');
  }

  let envs;
  try {
    envs = readFileSync(envFile[0])
      .toString()
      .split('\n')
      .reduce((m, line) => {
        line = (line || '').trim();
        if (/^#/.test(line)) return m;
        if (!line.length) return m;
        const parts = line.split('=');
        m[parts[0].trim()] = parts[1].trim();
        return m;
      }, {});
  } catch (e) {
    throw new Error('missing env files or bad syntax');
  }

  envs.PGEXTENSIONS = extensions.join(',');
  writeFileSync(
    envFile[0],
    Object.keys(envs).reduce((m, key) => {
      const value = envs[key];
      m = `${m}\n${key}=${value}`;
      return m;
    }, '')
  );
};
