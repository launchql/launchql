import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { relative } from 'path';

interface DependencyGraph {
  [key: string]: string[];
}

interface DependencyResult {
  external: string[];
  resolved: string[];
  deps: DependencyGraph;
}

const makeKey = (sqlmodule: string): string => `/deploy/${sqlmodule}.sql`;

export const getDeps = async (
  packageDir: string,
  extname: string
): Promise<DependencyResult> => {
  const external: string[] = [];
  const deps: DependencyGraph = {};

  // Original dependency resolution algorithm
  function dep_resolve(
    sqlmodule: string,
    resolved: string[],
    unresolved: string[]
  ): void {
    unresolved.push(sqlmodule);
    let edges = deps[makeKey(sqlmodule)];
    
    if (/:/.test(sqlmodule)) {
      // Has a prefix — could be internal or external
      const [project, localKey] = sqlmodule.split(':', 2);
      if (project === extname) {
        // Internal reference to current project
        sqlmodule = localKey;
        edges = deps[makeKey(localKey)];
        if (!edges) {
          throw new Error(`Internal module not found: ${localKey} (from ${project}:${localKey})`);
        }
      } else {
        // External reference — always OK, even if not in deps yet
        external.push(sqlmodule);
        deps[sqlmodule] = [];
        return;
      }
    } else {
      // No prefix — must be internal
      if (!edges) {
        throw new Error(`Internal module not found: ${sqlmodule}`);
      }
    }
        
    for (const dep of edges) {
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }

    resolved.push(sqlmodule);
    const index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  // Process SQL files and build dependency graph
  const files = glob(`${packageDir}/deploy/**/*.sql`);

  for (const file of files) {
    const data = readFileSync(file, 'utf-8');
    const lines = data.split('\n');
    const key = '/' + relative(packageDir, file);
    deps[key] = [];
    // console.log(key, data);

    for (const line of lines) {
      // Handle requires statements
      const requiresMatch = line.match(/^-- requires: (.*)/);
      if (requiresMatch) {
        deps[key].push(requiresMatch[1].trim());
        continue;
      }

      // Handle deploy statements - exactly as in original
      let m2;
      let keyToTest;

      if (/:/.test(line)) {
        m2 = line.match(/^-- Deploy ([^:]*):([\w\/]+) to pg/);
        if (m2) {
          const actualProject = m2[1];
          keyToTest = m2[2];
        
          if (extname !== actualProject) {
            throw new Error(
              `Mismatched project name in deploy file:
          Expected project: ${extname}
          Found in line   : ${actualProject}
          Line            : ${line}`
            );
          }
        
          const expectedKey = makeKey(keyToTest);
          if (key !== expectedKey) {
            throw new Error(
              `Deployment script path or internal name mismatch:
          Expected key    : ${key}
          Found in line   : ${expectedKey}
          Line            : ${line}`
            );
          }
        }

      } else {
        m2 = line.match(/^-- Deploy (.*) to pg/);
        if (m2) {
          keyToTest = m2[1];
          if (key !== makeKey(keyToTest)) {
            throw new Error(
              'deployment script in wrong place or is named wrong internally\n' + line
            );
          }
        }
      }
    }
  }

  let resolved: string[] = [];
  const unresolved: string[] = [];

  // Add synthetic root node - exactly as in original
  deps[makeKey('apps/index')] = Object.keys(deps)
    .filter((dep) => dep.startsWith('/deploy/'))
    .map((dep) => dep.replace(/^\/deploy\//, '').replace(/\.sql$/, ''));

  dep_resolve('apps/index', resolved, unresolved);
  
  // Remove synthetic root
  const index = resolved.indexOf('apps/index');
  resolved.splice(index, 1);
  delete deps[makeKey('apps/index')];

  // Sort extensions first - exactly as in original
  const extensions = resolved.filter((module) => module.startsWith('extensions/'));
  const normalSql = resolved.filter((module) => !module.startsWith('extensions/'));
  resolved = [...extensions, ...normalSql];

  return { external, resolved, deps };
};

export const extDeps = async (
  name: string,
  modules: Record<string, { requires: string[] }>
): Promise<{ external: string[]; resolved: string[] }> => {
  if (!modules[name]) {
    throw new Error(`module ${name} does not exist!`);
  }

  const external: string[] = [];
  const deps: DependencyGraph = Object.keys(modules).reduce((memo, key) => {
    memo[key] = modules[key].requires;
    return memo;
  }, {} as DependencyGraph);

  function dep_resolve(
    sqlmodule: string,
    resolved: string[],
    unresolved: string[]
  ): void {
    unresolved.push(sqlmodule);
    let edges = deps[sqlmodule];
    
    if (!edges) {
      external.push(sqlmodule);
      edges = deps[sqlmodule] = [];
    }

    for (const dep of edges) {
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }

    resolved.push(sqlmodule);
    const index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  const resolved: string[] = [];
  const unresolved: string[] = [];

  dep_resolve(name, resolved, unresolved);

  return { external, resolved };
};