import { readFileSync, readFile } from 'fs';
import { basename, dirname, resolve, relative } from 'path';
import { sync as glob } from 'glob';
import { listModules } from './modules';
import { getExtensionName } from './extensions';

const makeKey = sqlmodule => '/deploy/' + sqlmodule + '.sql';

export const getDeps = async (packageDir) => {

  const extname = await getExtensionName(packageDir);

  var external = [];

  var deps = {};

  // https://www.electricmonk.nl/log/2008/08/07/dependency-resolving-algorithm/
  function dep_resolve(
    sqlmodule,
    resolved,
    unresolved
  ) {
    unresolved.push(sqlmodule);
    let edges = deps[makeKey(sqlmodule)];
    if (!edges) {
      if (/:/.test(sqlmodule)) {
        external.push(sqlmodule);
        edges = deps[sqlmodule] = [];
      } else {
        throw new Error(`no module ${sqlmodule}`);
      }
    }

    for (var i = 0; i < edges.length; i++) {
      var dep = edges[i];
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }

    resolved.push(sqlmodule);
    var index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  var files = await glob(`${packageDir}/deploy/**/**.sql`);

  for (var i = 0; i < files.length; i++) {
    const data = readFileSync(files[i]);
    var lines = data.toString().split('\n');
    const key = '/' + relative(packageDir, files[i]);
    deps[key] = [];

    for (var j = 0; j < lines.length; j++) {
      var m = lines[j].match(/-- requires: (.*)/);
      if (m) {
        deps[key].push(m[1].trim());
      }

      // check only:
      var m2;
      var keyToTest;

      if (/:/.test(lines[j])) {
        m2 = lines[j].match(/-- Deploy ([^:]*):([\w\/]+) to pg/);
        if (m2) {
          keyToTest = m2[2];
          if (extname !== m2[1]) {
            throw new Error(
              'referencing bad project name inside of deploy file\n' + lines[j]
            );
          }
          if (key != makeKey(keyToTest)) {
            throw new Error(
              'deployment script in wrong place or is named wrong internally\n' + lines[j]
            );
          }
        }
      } else {
        m2 = lines[j].match(/-- Deploy (.*) to pg/);
        if (m2) {
          keyToTest = m2[1];
          if (key != makeKey(keyToTest)) {
            throw new Error(
              'deployment script in wrong place or is named wrong internally\n' + lines[j]
            );
          }
        }
      }
    }
  }

  let resolved = [];
  var unresolved = [];

  deps = Object.assign(
    {
      [makeKey('apps/index')]: Object.keys(deps)
        .filter(dep => dep.match(/^\/deploy\//))
        .map(dep => dep.replace(/^\/deploy\//, '').replace(/.sql$/, ''))
    },
    deps
  );

  dep_resolve('apps/index', resolved, unresolved);
  var index = resolved.indexOf('apps/index');
  resolved.splice(index);
  delete deps[makeKey('apps/index')];

  // move extensions up
  const extensions = resolved.filter(a => a.match(/^extensions/));
  const normalSql = resolved.filter(a => !a.match(/^extensions/));

  // resolved = useExtensions ? [...extensions, ...normalSql] : [...normalSql];
  resolved = [...extensions, ...normalSql];
  // resolved = [...normalSql];

  return {
    external,
    resolved,
    deps
  };

};

export const extDeps = async (name) => {

  const modules = await listModules();
  const external = [];
  if (!modules[name]) {
    throw new Error(`module ${name} does not exist!`);
  }
  // build deps
  let deps = Object.keys(modules).reduce((memo, key)=>{
    memo[key] = modules[key].requires;
    return memo;
  }, {});

  // https://www.electricmonk.nl/log/2008/08/07/dependency-resolving-algorithm/
  function dep_resolve(
    sqlmodule,
    resolved,
    unresolved
  ) {
    unresolved.push(sqlmodule);
    let edges = deps[sqlmodule];
    if (!edges) {
      external.push(sqlmodule);
      edges = deps[sqlmodule] = [];
    }

    for (var i = 0; i < edges.length; i++) {
      var dep = edges[i];
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }

    resolved.push(sqlmodule);
    var index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  let resolved = [];
  var unresolved = [];

  dep_resolve(name, resolved, unresolved);

  return {external, resolved};
};
