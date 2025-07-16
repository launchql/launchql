import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { relative, join } from 'path';
import { parsePlanFile } from './files/plan/parser';
import { ExtendedPlanFile } from './files/types';

interface DependencyGraph {
  [key: string]: string[];
}

interface DependencyResult {
  external: string[];
  resolved: string[];
  deps: DependencyGraph;
}

const makeKey = (sqlmodule: string): string => `/deploy/${sqlmodule}.sql`;

export const getDeps = (
  packageDir: string,
  extname: string
): DependencyResult => {
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

export const extDeps = (
  name: string,
  modules: Record<string, { requires: string[] }>
): { external: string[]; resolved: string[] } => {
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

export interface DependencyResolutionOptions {
  /**
   * How to handle tag references:
   * - 'preserve': Keep tags as-is, as changes in plan files
   * - 'resolve': Resolve tags to their target changes
   * - 'internal': Resolve internally but preserve in output
   */
  tagResolution?: 'preserve' | 'resolve' | 'internal';
  
  /**
   * Whether to load and parse plan files for tag resolution
   * Only applicable when tagResolution is 'resolve' or 'internal'
   */
  loadPlanFiles?: boolean;
  
  /**
   * Custom plan file loader function
   * Allows overriding the default plan file loading logic
   */
  planFileLoader?: (projectName: string, currentProject: string, packageDir: string) => ExtendedPlanFile | null;
}

/**
 * Unified dependency resolution function with configurable options
 * This is the main entry point for all dependency resolution needs
 */
export const resolveDependencies = (
  packageDir: string,
  extname: string,
  options: DependencyResolutionOptions = {}
): DependencyResult => {
  const {
    tagResolution = 'preserve',
    loadPlanFiles = true,
    planFileLoader
  } = options;
  
  // For 'preserve' mode, just use the original getDeps
  if (tagResolution === 'preserve') {
    return getDeps(packageDir, extname);
  }
  
  // For 'resolve' and 'internal' modes, we need plan file loading
  const planCache: Record<string, ExtendedPlanFile> = {};
  
  // Helper function to load a plan file for a project
  const loadPlanFile = (projectName: string): ExtendedPlanFile | null => {
    if (!loadPlanFiles) {
      return null;
    }
    
    if (planFileLoader) {
      return planFileLoader(projectName, extname, packageDir);
    }
    
    if (planCache[projectName]) {
      return planCache[projectName];
    }
    
    try {
      let planPath: string;
      if (projectName === extname) {
        // For the current project
        planPath = join(packageDir, 'launchql.plan');
      } else {
        // For external projects, try to find them in parent directories
        // This assumes a monorepo structure where packages are siblings
        const parentDir = join(packageDir, '..', '..');
        planPath = join(parentDir, 'packages', projectName, 'launchql.plan');
      }
      
      const result = parsePlanFile(planPath);
      if (result.data) {
        planCache[projectName] = result.data;
        return result.data;
      }
    } catch (error) {
      // Plan file not found or parse error
      console.warn(`Could not load plan file for project ${projectName}: ${error}`);
    }
    
    return null;
  };
  
  // Helper function to resolve a tag to the change it represents
  const resolveTagToChange = (projectName: string, tagName: string): string | null => {
    const plan = loadPlanFile(projectName);
    if (!plan) {
      return null;
    }
    
    // Find the tag
    const tag = plan.tags.find(t => t.name === tagName);
    if (!tag) {
      return null;
    }
    
    // Return the change this tag points to
    return tag.change;
  };
  
  const external: string[] = [];
  const deps: DependencyGraph = {};
  // Keep track of tag mappings for internal resolution
  const tagMappings: Record<string, string> = {};

  // Process SQL files and build dependency graph
  const files = glob(`${packageDir}/deploy/**/*.sql`);

  for (const file of files) {
    const data = readFileSync(file, 'utf-8');
    const lines = data.split('\n');
    const key = '/' + relative(packageDir, file);
    deps[key] = [];

    for (const line of lines) {
      // Handle requires statements
      const requiresMatch = line.match(/^-- requires: (.*)/);
      if (requiresMatch) {
        const dep = requiresMatch[1].trim();
        
        // Check if this is a tag reference
        if (dep.includes('@')) {
          const match = dep.match(/^([^:]+):@(.+)$/);
          if (match) {
            const [, projectName, tagName] = match;
            const taggedChange = resolveTagToChange(projectName, tagName);
            
            if (taggedChange) {
              if (tagResolution === 'resolve') {
                // Full resolution: replace tag with actual change
                const resolvedDep = `${projectName}:${taggedChange}`;
                deps[key].push(resolvedDep);
              } else if (tagResolution === 'internal') {
                // Internal resolution: keep tag in deps but track mapping
                tagMappings[dep] = `${projectName}:${taggedChange}`;
                deps[key].push(dep);
              }
            } else {
              // Could not resolve tag, keep it as is
              deps[key].push(dep);
            }
          } else {
            // Invalid tag format, keep as is
            deps[key].push(dep);
          }
        } else {
          // Not a tag, keep as is
          deps[key].push(dep);
        }
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

  // Modified dependency resolution algorithm
  function dep_resolve(
    sqlmodule: string,
    resolved: string[],
    unresolved: string[]
  ): void {
    unresolved.push(sqlmodule);
    
    // For internal resolution mode, check if this module is a tag and resolve it
    let moduleToResolve = sqlmodule;
    if (tagResolution === 'internal' && tagMappings[sqlmodule]) {
      moduleToResolve = tagMappings[sqlmodule];
    }
    
    let edges = deps[makeKey(moduleToResolve)];
    
    if (/:/.test(moduleToResolve)) {
      // Has a prefix — could be internal or external
      const [project, localKey] = moduleToResolve.split(':', 2);
      if (project === extname) {
        // Internal reference to current project
        moduleToResolve = localKey;
        edges = deps[makeKey(localKey)];
        if (!edges) {
          throw new Error(`Internal module not found: ${localKey} (from ${project}:${localKey})`);
        }
      } else {
        // External reference — always OK, even if not in deps yet
        external.push(sqlmodule); // Use original module name
        deps[sqlmodule] = deps[sqlmodule] || [];
        return;
      }
    } else {
      // No prefix — must be internal
      if (!edges) {
        // Check if we have edges for the original module
        edges = deps[makeKey(sqlmodule)];
        if (!edges) {
          throw new Error(`Internal module not found: ${sqlmodule}`);
        }
      }
    }
        
    for (const dep of edges) {
      // For internal resolution, resolve the dependency if it's a tag
      let depToResolve = dep;
      if (tagResolution === 'internal' && tagMappings[dep]) {
        depToResolve = tagMappings[dep];
      }
      
      if (!resolved.includes(depToResolve)) {
        if (unresolved.includes(depToResolve)) {
          throw new Error(`Circular reference detected ${moduleToResolve}, ${depToResolve}`);
        }
        dep_resolve(dep, resolved, unresolved); // Use original dep name for recursion
      }
    }

    resolved.push(moduleToResolve);
    const index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
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
