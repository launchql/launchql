import { readFileSync, readFile } from 'fs';
import { basename, dirname, resolve, relative } from 'path';
import { sync as glob } from 'glob';
import { skitchPath } from './paths';
import { existsSync } from 'fs';

let _listModules = null;
export const listModules = async () => {
  if (_listModules) return _listModules;
  const path = await skitchPath();
  // TODO use skitchPath/package.json to get packages/*

  const moduleFiles = glob(path + '/**/*.control')
    .filter((c) => !/node_modules/.test(c))
    .concat(
      existsSync(path + '/node_modules')
        ? glob(path + '/node_modules/**/*.control')
        : []
    );
  const extensions = moduleFiles.reduce((m, v) => {
    const contents = readFileSync(v).toString();
    const key = basename(v).split('.control')[0];
    m[key] = {};
    m[key] = { path: dirname(relative(path, v)) };
    m[key].requires = contents
      .split('\n')
      .find((el) => /^requires/.test(el))
      .split('=')[1]
      .split(',')
      .map((el) => el.replace(/[\'\s]*/g, '').trim());
    m[key].version = contents
      .split('\n')
      .find((el) => /^default_version/.test(el))
      .split('=')[1]
      .replace(/[\']*/g, '')
      .trim();
    return m;
  }, {});
  _listModules = extensions;
  return extensions;
};
export const _clearModuleCache = () => {
  _listModules = null;
};

export const latestChange = async (sqlmodule) => {
  const modules = await listModules();
  if (!modules[sqlmodule]) {
    throw new Error(`latestChange() ${sqlmodule} NOT FOUND!`);
  }
  const path = await skitchPath();
  const plan = readFileSync(`${path}/${modules[sqlmodule].path}/sqitch.plan`)
    .toString()
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a);
  return plan[plan.length - 1].split(' ')[0];
};

export const latestChangeAndVersion = async (sqlmodule) => {
  const modules = await listModules();
  if (!modules[sqlmodule]) {
    throw new Error(`latestChange() ${sqlmodule} NOT FOUND!`);
  }
  const path = await skitchPath();
  const plan = readFileSync(`${path}/${modules[sqlmodule].path}/sqitch.plan`)
    .toString()
    .split('\n')
    .map((a) => a.trim())
    .filter((a) => a);
  const change = plan[plan.length - 1].split(' ')[0];
  const version = require(`${path}/${modules[sqlmodule].path}/package.json`)
    .version;
  return {
    change,
    version
  };
};

export const getExtensionsAndModules = async (sqlmodule) => {
  const modules = await listModules();
  if (!modules[sqlmodule]) {
    throw new Error(`getExtensionsAndModules() ${sqlmodule} NOT FOUND!`);
  }
  const native = modules[sqlmodule].requires.filter(
    (a) => !Object.keys(modules).includes(a)
  );
  const sqitch = modules[sqlmodule].requires.filter((a) =>
    Object.keys(modules).includes(a)
  );
  return {
    native,
    sqitch
  };
};

export const getExtensionsAndModulesChanges = async (sqlmodule) => {
  const modules = await getExtensionsAndModules(sqlmodule);
  const sqitchies = [];
  for (let i = 0; i < modules.sqitch.length; i++) {
    const mod = modules.sqitch[i];
    const { change, version } = await latestChangeAndVersion(mod);
    sqitchies.push({ name: mod, latest: change, version });
  }
  modules.sqitch = sqitchies;
  return modules;
};
