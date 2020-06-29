import { readFileSync, readFile } from 'fs';
import { basename, dirname, resolve, relative } from 'path';
import { sync as glob } from 'glob';
import { skitchPath } from './paths';
import {
  listModules,
  getExtensionsAndModulesChanges,
  _clearModuleCache
} from './modules';
import { getDeps } from './deps';

export const makePlan = async (packageDir, options) => {
  let { name, uri, projects } = options;
  if (!name) {
    throw new Error('plans require a project name');
  }
  if (!uri) uri = name;

  // TEMP
  var now = '2017-08-11T08:11:51Z';

  var planfile = [];

  planfile.push(`%syntax-version=1.0.0
%project=${name}
%uri=${name}
  `);

  const { resolved, deps } = await getDeps(packageDir);

  const externalReqs = [];

  if (projects) {
    const skPath = await skitchPath();
    _clearModuleCache();
    const results = await getExtensionsAndModulesChanges(name);
    [].push.apply(externalReqs, results.sqitch);
  }

  const makeKey = (sqlmodule) => '/deploy/' + sqlmodule + '.sql';
  if (resolved.length) {
    [].push.apply(
      deps[makeKey(resolved[0])],
      externalReqs.map((a) => `${a.name}:${a.latest}`)
    );
  }

  resolved.forEach((res) => {
    // TODO allow for two plans
    if (/:/.test(res)) return;

    if (deps[makeKey(res)] && deps[makeKey(res)].length) {
      planfile.push(
        `${res} [${deps[makeKey(res)].join(
          ' '
        )}] ${now} skitch <skitch@5b0c196eeb62> # add ${res}`
      );
    } else {
      planfile.push(`${res} ${now} skitch <skitch@5b0c196eeb62> # add ${res}`);
    }
  });

  return planfile.join('\n');
};

export const getPlan = async (options) => {
  const modules = await listModules();
  if (!modules[options.name]) {
    throw new Error(`getPlan() ${options.name} NOT FOUND!`);
  }
  const path = await skitchPath();
  const packageDir = `${path}/${modules[options.name].path}`;

  return await makePlan(packageDir, options);
};
