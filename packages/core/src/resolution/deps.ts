import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { join,relative } from 'path';

import { PgpmPackage } from '../core/class/pgpm';
import { parsePlanFile } from '../files/plan/parser';
import { ExtendedPlanFile } from '../files/types';
import { errors } from '@pgpmjs/types';

/**
 * Represents a dependency graph where keys are module identifiers
 * and values are arrays of their direct dependencies
 */
interface DependencyGraph {
  [key: string]: string[];
}

/**
 * Result object returned by dependency resolution functions
 */
export interface DependencyResult {
  /** Array of external dependencies that are not part of the current package */
  external: string[];
  /** Array of modules in topologically sorted order for deployment */
  resolved: string[];
  /** The complete dependency graph mapping modules to their dependencies */
  deps: DependencyGraph;
  /** Mapping of resolved tags to their target changes (only for resolveDependencies) */
  resolvedTags?: Record<string, string>;
}

/**
 * Configuration options for customizing the core dependency resolver behavior.
 * This interface allows different dependency resolution functions to share the same
 * core algorithm while maintaining their specific behaviors.
 */
interface DependencyResolverOptions {
  /** 
   * Function to handle external dependencies when they are not found in the dependency graph.
   * Used by resolveExtensionDependencies to add external dependencies to the external array.
   * @param dep - The dependency module name that was not found
   * @param deps - The dependency graph to potentially add the dependency to
   * @param external - Array to collect external dependencies
   */
  handleExternalDep?: (dep: string, deps: DependencyGraph, external: string[]) => void;
  
  /** 
   * Function to transform module names and resolve their dependencies during resolution.
   * Used by getDeps and resolveDependencies to handle project:module syntax and tag resolution.
   * @param module - The module name to transform
   * @param extname - The current package/extension name for context
   * @returns Object containing the transformed module name, its dependency edges, and whether to return early
   */
  transformModule?: (module: string, extname: string) => { module: string; edges: string[] | undefined; returnEarly?: boolean };
  
  /** 
   * Function to generate standardized keys for dependency lookup in the graph.
   * Defaults to the module name as-is if not provided.
   * @param module - The module name to generate a key for
   * @returns The standardized key for dependency graph lookup
   */
  makeKey?: (module: string) => string;
  
  /** 
   * The current project/extension name used for internal reference resolution.
   * This is used to distinguish between internal and external module references.
   */
  extname: string;
}

/**
 * Core dependency resolution algorithm that handles circular dependency detection
 * and topological sorting of dependencies. This unified implementation eliminates
 * code duplication between getDeps, resolveExtensionDependencies, and resolveDependencies.
 * 
 * @param deps - The dependency graph mapping modules to their dependencies
 * @param external - Array to collect external dependencies
 * @param options - Configuration options for customizing resolver behavior
 * @returns A function that performs dependency resolution with the given configuration
 */
function createDependencyResolver(
  deps: DependencyGraph,
  external: string[],
  options: DependencyResolverOptions
) {
  const { 
    handleExternalDep, 
    transformModule, 
    makeKey = (module: string) => module,
    extname 
  } = options;

  return function dep_resolve(
    sqlmodule: string,
    resolved: string[],
    unresolved: string[]
  ): void {
    unresolved.push(sqlmodule);
    
    let moduleToResolve = sqlmodule;
    let edges: string[] | undefined;
    let returnEarly = false;

    if (transformModule) {
      const result = transformModule(sqlmodule, extname);
      moduleToResolve = result.module;
      edges = result.edges;
      returnEarly = result.returnEarly || false;
    } else {
      edges = deps[makeKey(sqlmodule)];
    }

    // Handle external dependencies if no edges found
    if (!edges) {
      if (handleExternalDep) {
        handleExternalDep(sqlmodule, deps, external);
        edges = deps[sqlmodule] || [];
      } else {
        throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
      }
    }

    if (returnEarly) {
      const index = unresolved.indexOf(sqlmodule);
      unresolved.splice(index, 1);
      return;
    }

    // Process each dependency
    for (const dep of edges) {
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw errors.CIRCULAR_DEPENDENCY({ module: moduleToResolve, dependency: dep });
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }

    resolved.push(moduleToResolve);
    const index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index, 1);
  };
}

/**
 * Generates a standardized key for SQL deployment files
 * @param sqlmodule - The module name (e.g., 'users/create')
 * @returns The standardized file path key (e.g., '/deploy/users/create.sql')
 */
const makeKey = (sqlmodule: string): string => `/deploy/${sqlmodule}.sql`;


/**
 * Resolves dependencies for extension modules using a pre-built module map.
 * This is a simpler version that works with module metadata rather than parsing SQL files.
 * 
 * @param name - The name of the module to resolve dependencies for
 * @param modules - Record mapping module names to their dependency requirements
 * @returns Object containing external dependencies and resolved dependency order
 */
export const resolveExtensionDependencies = (
  name: string,
  modules: Record<string, { requires: string[] }>
): { external: string[]; resolved: string[] } => {
  if (!modules[name]) {
    throw errors.MODULE_NOT_FOUND({ name });
  }

  const external: string[] = [];
  const deps: DependencyGraph = Object.keys(modules).reduce((memo, key) => {
    memo[key] = modules[key].requires;
    return memo;
  }, {} as DependencyGraph);

  // Handle external dependencies for resolveExtensionDependencies - simpler than getDeps
  const handleExternalDep = (dep: string, deps: DependencyGraph, external: string[]): void => {
    external.push(dep);
    deps[dep] = [];
  };

  // Create the dependency resolver with resolveExtensionDependencies-specific configuration
  const dep_resolve = createDependencyResolver(deps, external, {
    handleExternalDep,
    extname: name // For resolveExtensionDependencies, we use the module name as extname
  });

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

  // Source of dependency graph:
  // - 'sql' (default): parse deploy/**/*.sql headers
  // - 'plan': build graph from plan files only
  source?: 'sql' | 'plan';
}

// 
// 
// 
// 
// 
//   - for each change in the plan, create a node in the dependency graph and add edges for any declared dependencies.
// 
// 
// - Cross-package references:
// 
// 
// 
// 

// resolveDependencies overview
// - Purpose: compute dependency graph and apply order for a package/module.
// - Sources: 'sql' (parse headers + topo + extensions-first) vs 'plan' (use plan.changes order directly).
// - Tags: 'preserve' (keep), 'internal' (map for traversal), 'resolve' (replace with change names).
// - Output: { external, resolved, deps, resolvedTags? }.
// Detailed notes are placed inline near the relevant code paths below.
export const resolveDependencies = (
  packageDir: string,
  extname: string,
  options: DependencyResolutionOptions = {}
): DependencyResult => {
  const {
    tagResolution = 'preserve',
    loadPlanFiles = true,
    planFileLoader,
    source = 'sql'
  } = options;
  
  // For 'resolve' and 'internal' modes, we need plan file loading
  const planCache: Record<string, ExtendedPlanFile> = {};
  
  // Helper function to load a plan file for a package
  const loadPlanFile = (packageName: string): ExtendedPlanFile | null => {
    if (!loadPlanFiles) {
      return null;
    }
    
    if (planFileLoader) {
      return planFileLoader(packageName, extname, packageDir);
    }
    
    if (planCache[packageName]) {
      return planCache[packageName];
    }
    
    try {
      let planPath: string;
      if (packageName === extname) {
        // For the current package
        planPath = join(packageDir, 'pgpm.plan');
      } else {
        // For external packages, use PgpmPackage to find module path
        const project = new PgpmPackage(packageDir);
        const moduleMap = project.getModuleMap();
        const module = moduleMap[packageName];
        
        if (!module) {
          throw errors.MODULE_NOT_FOUND({ name: packageName });
        }
        
        const workspacePath = project.getWorkspacePath();
        if (!workspacePath) {
          throw new Error(`No workspace found for module ${packageName}`);
        }
        
        planPath = join(workspacePath, module.path, 'pgpm.plan');
      }
      
      const result = parsePlanFile(planPath);
      if (result.data) {
        planCache[packageName] = result.data;
        return result.data;
      }
    } catch (error) {
      // Plan file not found or parse error
      console.warn(`Could not load plan file for package ${packageName}: ${error}`);
    }
    
    return null;
  };
  
// Plan-mode branch: use plan.changes order directly; build graph from plan deps (no topo or resort).
// - Loads the current package plan and throws if missing.
// - For each change in plan, adds a node; edges come from change.dependencies.
// - Tag handling per tagResolution: 'preserve' keeps tokens, 'internal' maps for traversal, 'resolve' replaces with change names.
// - Cross-package refs "pkg:change" are recorded in external and kept as graph nodes for coordination by callers.
// - Internal refs like "extname:change" are normalized to "change".
  const resolveTagToChange = (projectName: string, tagName: string): string | null => {
    const plan = loadPlanFile(projectName);
    if (!plan) return null;
    const tag = plan.tags.find(t => t.name === tagName);
    if (!tag) return null;
    return tag.change;
  };
  
  if (source === 'plan') {
    const plan = loadPlanFile(extname);
    if (!plan) {
      throw errors.PLAN_PARSE_ERROR({ planPath: `${extname}/pgpm.plan`, errors: 'Plan file not found or failed to parse while using plan-only resolution' });
    }

    const external: string[] = [];
    const deps: DependencyGraph = {};
    const tagMappings: Record<string, string> = {};

    const normalizeInternal = (dep: string): string => {
      if (/:/.test(dep)) {
        const [project, localKey] = dep.split(':', 2);
        if (project === extname) return localKey;
      }
      return dep;
    };

    const resolveTagDep = (projectName: string, tagName: string): string | null => {
      const change = resolveTagToChange(projectName, tagName);
      if (!change) return null;
      return `${projectName}:${change}`;
    };

    for (const ch of plan.changes) {
      const key = makeKey(ch.name);
      deps[key] = [];
      const changeDeps: string[] = (ch as any).dependencies || [];
      for (const rawDep of changeDeps) {
        let dep = rawDep.trim();

        if (dep.includes('@')) {
          const m = dep.match(/^([^:]+):@(.+)$/);
          if (m) {
            const projectName = m[1];
            const tagName = m[2];
            const resolved = resolveTagDep(projectName, tagName);
            if (resolved) {
              if (tagResolution === 'resolve') dep = resolved;
              else if (tagResolution === 'internal') tagMappings[dep] = resolved;
            }
          } else {
            const m2 = dep.match(/^@(.+)$/);
            if (m2) {
              const tagName = m2[1];
              const resolved = resolveTagDep(extname, tagName);
              if (resolved) {
                if (tagResolution === 'resolve') dep = resolved;
                else if (tagResolution === 'internal') tagMappings[dep] = resolved;
              }
            }
          }
        }

        if (/:/.test(dep)) {
          const [project] = dep.split(':', 2);
          if (project !== extname) {
            external.push(dep);
            if (!deps[dep]) deps[dep] = [];
            deps[key].push(dep);
            continue;
          }
          deps[key].push(normalizeInternal(dep));
          continue;
        }

        deps[key].push(dep);
      }
    }

    const transformModule = (sqlmodule: string, extnameLocal: string): { module: string; edges: string[] | undefined; returnEarly?: boolean } => {
      const originalModule = sqlmodule;

      if (tagResolution === 'preserve') {
        let moduleToResolve = sqlmodule;
        let edges = deps[makeKey(sqlmodule)];
        if (/:/.test(sqlmodule)) {
          const [project, localKey] = sqlmodule.split(':', 2);
          if (project === extnameLocal) {
            moduleToResolve = localKey;
            edges = deps[makeKey(localKey)];
            if (!edges) throw errors.MODULE_NOT_FOUND({ name: `${localKey} (from ${project}:${localKey})` });
          } else {
            external.push(sqlmodule);
            deps[sqlmodule] = deps[sqlmodule] || [];
            return { module: sqlmodule, edges: [], returnEarly: true };
          }
        } else {
          if (!edges) throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
        }
        return { module: moduleToResolve, edges };
      }

      if (/:/.test(originalModule)) {
        const [project] = originalModule.split(':', 2);
        if (project !== extnameLocal) {
          external.push(originalModule);
          deps[originalModule] = deps[originalModule] || [];
          return { module: originalModule, edges: [], returnEarly: true };
        }
      }

      let moduleToResolve = sqlmodule;
      if (tagResolution === 'internal' && tagMappings[sqlmodule]) {
        moduleToResolve = tagMappings[sqlmodule];
      }

      let edges = deps[makeKey(moduleToResolve)];
      if (/:/.test(moduleToResolve)) {
        const [project, localKey] = moduleToResolve.split(':', 2);
        if (project === extnameLocal) {
          moduleToResolve = localKey;
          edges = deps[makeKey(localKey)];
          if (!edges) throw errors.MODULE_NOT_FOUND({ name: `${localKey} (from ${project}:${localKey})` });
        }
      } else {
        if (!edges) {
          edges = deps[makeKey(sqlmodule)];
          if (!edges) throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
        }
      }

      if (tagResolution === 'internal' && edges) {
        const processedEdges = edges.map(dep => {
          if (/:/.test(dep)) {
            const [project] = dep.split(':', 2);
            if (project !== extnameLocal) return dep;
          }
          if (tagMappings[dep]) return tagMappings[dep];
          return dep;
        });
        return { module: moduleToResolve, edges: processedEdges };
      }

      return { module: moduleToResolve, edges };
    };

    // or extension-first resorting. Externals are still tracked in the deps graph and external array.
    const resolved: string[] = plan.changes.map(ch => ch.name);
 
    return { external, resolved, deps, resolvedTags: tagMappings };
  }

  const external: string[] = [];
  const deps: DependencyGraph = {};
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
        
        // For 'preserve' mode, just add the dependency as-is (like original getDeps)
        if (tagResolution === 'preserve') {
          deps[key].push(dep);
          continue;
        }
        
        // For other modes, handle tag resolution
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
        m2 = line.match(/^-- Deploy ([^:]*):([\w\/]+)(?:\s+to\s+pg)?/);
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
        m2 = line.match(/^-- Deploy (.*?)(?:\s+to\s+pg)?\s*$/);
        if (m2) {
          keyToTest = m2[1].trim();
          if (key !== makeKey(keyToTest)) {
            throw new Error(
              'deployment script in wrong place or is named wrong internally\n' + line
            );
          }
        }
      }
    }
  }

  const transformModule = (sqlmodule: string, extname: string): { module: string; edges: string[] | undefined; returnEarly?: boolean } => {
    const originalModule = sqlmodule;
    
    // For 'preserve' mode, use simpler logic (like original getDeps)
    if (tagResolution === 'preserve') {
      let moduleToResolve = sqlmodule;
      let edges = deps[makeKey(sqlmodule)];
      
      if (/:/.test(sqlmodule)) {
        // Has a prefix — could be internal or external
        const [project, localKey] = sqlmodule.split(':', 2);
        if (project === extname) {
          // Internal reference to current package
          moduleToResolve = localKey;
          edges = deps[makeKey(localKey)];
          if (!edges) {
            throw errors.MODULE_NOT_FOUND({ name: `${localKey} (from ${project}:${localKey})` });
          }
        } else {
          // External reference — always OK, even if not in deps yet
          external.push(sqlmodule);
          deps[sqlmodule] = [];
          return { module: sqlmodule, edges: [], returnEarly: true };
        }
      } else {
        // No prefix — must be internal
        if (!edges) {
          throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
        }
      }
      
      return { module: moduleToResolve, edges };
    }
    
    // Check if the ORIGINAL module (before tag resolution) is external
    if (/:/.test(originalModule)) {
      const [project, localKey] = originalModule.split(':', 2);
      if (project !== extname) {
        // External reference — always OK, even if not in deps yet
        external.push(originalModule);
        deps[originalModule] = deps[originalModule] || [];
        return { module: originalModule, edges: [], returnEarly: true };
      }
    }
    
    // For internal resolution mode, check if this module is a tag and resolve it
    let moduleToResolve = sqlmodule;
    if (tagResolution === 'internal' && tagMappings[sqlmodule]) {
      moduleToResolve = tagMappings[sqlmodule];
    }
    
    let edges = deps[makeKey(moduleToResolve)];
    
    if (/:/.test(moduleToResolve)) {
      // Has a prefix — must be internal since we already handled external above
      const [project, localKey] = moduleToResolve.split(':', 2);
      if (project === extname) {
        // Internal reference to current package
        moduleToResolve = localKey;
        edges = deps[makeKey(localKey)];
        if (!edges) {
          throw errors.MODULE_NOT_FOUND({ name: `${localKey} (from ${project}:${localKey})` });
        }
      }
    } else {
      // No prefix — must be internal
      if (!edges) {
        // Check if we have edges for the original module
        edges = deps[makeKey(sqlmodule)];
        if (!edges) {
          throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
        }
      }
    }
    
    // For internal resolution, process dependencies through tag mappings
    if (tagResolution === 'internal' && edges) {
      const processedEdges = edges.map(dep => {
        // Check if this dependency is external - if so, don't resolve tags
        if (/:/.test(dep)) {
          const [project, localKey] = dep.split(':', 2);
          if (project !== extname) {
            // External dependency - keep original tag name
            return dep;
          }
        }
        
        // Internal dependency - apply tag mapping if available
        if (tagMappings[dep]) {
          return tagMappings[dep];
        }
        return dep;
      });
      return { module: moduleToResolve, edges: processedEdges };
    }
    
    return { module: moduleToResolve, edges };
  };

  // Create the dependency resolver with resolveDependencies-specific configuration
  const dep_resolve = createDependencyResolver(deps, external, {
    transformModule,
    makeKey,
    extname
  });

  let resolved: string[] = [];
  const unresolved: string[] = [];

  // Synthetic root '_virtual/app' seeds local deploy/* modules into resolver for topo ordering.
  // Removed after resolution; not present in returned output.
  // Followed by extension-first reordering for deterministic application in SQL mode only.
  // Add synthetic root node - exactly as in original
  deps[makeKey('_virtual/app')] = Object.keys(deps)
    .filter((dep) => dep.startsWith('/deploy/'))
    .map((dep) => dep.replace(/^\/deploy\//, '').replace(/\.sql$/, ''));

  dep_resolve('_virtual/app', resolved, unresolved);

  const index = resolved.indexOf('_virtual/app');
  resolved.splice(index, 1);
  delete deps[makeKey('_virtual/app')];

  const extensions = resolved.filter((module) => module.startsWith('extensions/'));
  const normalSql = resolved.filter((module) => !module.startsWith('extensions/'));
  resolved = [...extensions, ...normalSql];

  return { external, resolved, deps, resolvedTags: tagMappings };
}
