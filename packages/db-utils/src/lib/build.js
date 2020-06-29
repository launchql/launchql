import { listModules, getExtensionsAndModulesChanges } from './modules';
import { dirname, basename, resolve } from 'path';
import { skitchPath as sPath } from './paths';
import { readFileSync } from 'fs';

export const build = async (project) => {
  const skitchPath = await sPath();
  const modules = await listModules();
  const modulesWithChanges = await getExtensionsAndModulesChanges(project);
  const native = [];

  const extensions = Object.keys(modules).reduce((m, key) => {
    const mod = modules[key];
    m[key] = {
      ...mod,
      sql: readFileSync(
        resolve(`${skitchPath}/${mod.path}/sql/${key}--${mod.version}.sql`)
      )
        .toString()
        .split('\n')
        .filter((l, i) => i !== 0)
        .join('\n')
    };
    return m;
  }, {});

  let deps = Object.keys(extensions).reduce((m, k) => {
    m[k] = extensions[k].requires;
    return m;
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
      native.push(sqlmodule);
      edges = deps[sqlmodule] = [];
    }
    for (let i = 0; i < edges.length; i++) {
      let dep = edges[i];
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }
    resolved.push(sqlmodule);
    let index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  let resolved = [];
  let unresolved = [];

  dep_resolve(project, resolved, unresolved);

  let sql = [];

  resolved.forEach(extension => {
    if (native.includes(extension)) {
      sql.push(`CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`);
    } else {
      sql.push(extensions[extension].sql);
    }
  });
  return sql.join('\n');
};
