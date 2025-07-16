import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { relative, join } from 'path';
import { parsePlanFile } from './files/plan/parser';
import { ExtendedPlanFile } from './files/types';
import { LaunchQLProject } from './class/launchql';

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
interface DependencyResult {
  /** Array of external dependencies that are not part of the current project */
  external: string[];
  /** Array of modules in topologically sorted order for deployment */
  resolved: string[];
  /** The complete dependency graph mapping modules to their dependencies */
  deps: DependencyGraph;
}

/**
 * Configuration options for customizing the core dependency resolver behavior.
 * This interface allows different dependency resolution functions to share the same
 * core algorithm while maintaining their specific behaviors.
 */
interface DependencyResolverOptions {
  /** 
   * Function to handle external dependencies when they are not found in the dependency graph.
   * Used by extDeps to add external dependencies to the external array.
   * @param dep - The dependency module name that was not found
   * @param deps - The dependency graph to potentially add the dependency to
   * @param external - Array to collect external dependencies
   */
  handleExternalDep?: (dep: string, deps: DependencyGraph, external: string[]) => void;
  
  /** 
   * Function to transform module names and resolve their dependencies during resolution.
   * Used by getDeps and resolveDependencies to handle project:module syntax and tag resolution.
   * @param module - The module name to transform
   * @param extname - The current project/extension name for context
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
 * code duplication between getDeps, extDeps, and resolveDependencies.
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
        throw new Error(`Internal module not found: ${sqlmodule}`);
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
          throw new Error(`Circular reference detected ${moduleToResolve}, ${dep}`);
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
 * Resolves dependencies for SQL deployment files in a package directory.
 * This is a simplified wrapper around resolveDependencies for backward compatibility.
 * 
 * @param packageDir - The package directory containing SQL files
 * @param extname - The extension/project name for internal reference resolution
 * @returns Object containing external dependencies, resolved order, and dependency graph
 */
export const getDeps = (
  packageDir: string,
  extname: string
): DependencyResult => {
  return resolveDependencies(packageDir, extname, { tagResolution: 'preserve' });
};

/**
 * Resolves dependencies for extension modules using a pre-built module map.
 * This is a simpler version that works with module metadata rather than parsing SQL files.
 * 
 * @param name - The name of the module to resolve dependencies for
 * @param modules - Record mapping module names to their dependency requirements
 * @returns Object containing external dependencies and resolved dependency order
 */
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

  // Handle external dependencies for extDeps - simpler than getDeps
  const handleExternalDep = (dep: string, deps: DependencyGraph, external: string[]): void => {
    external.push(dep);
    deps[dep] = [];
  };

  // Create the dependency resolver with extDeps-specific configuration
  const dep_resolve = createDependencyResolver(deps, external, {
    handleExternalDep,
    extname: name // For extDeps, we use the module name as extname
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
}

/**
 * Unified dependency resolution function with configurable options.
 * This is the main entry point for all dependency resolution needs,
 * supporting advanced features like tag resolution and plan file loading.
 * 
 * @param packageDir - The package directory containing SQL files
 * @param extname - The extension/project name for internal reference resolution
 * @param options - Configuration options for dependency resolution behavior
 * @returns Object containing external dependencies, resolved order, and dependency graph
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
        // For external projects, use LaunchQLProject to find module path
        const project = new LaunchQLProject(packageDir);
        const moduleMap = project.getModuleMap();
        const module = moduleMap[projectName];
        
        if (!module) {
          throw new Error(`Module ${projectName} not found in workspace`);
        }
        
        const workspacePath = project.getWorkspacePath();
        if (!workspacePath) {
          throw new Error(`No workspace found for module ${projectName}`);
        }
        
        planPath = join(workspacePath, module.path, 'launchql.plan');
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
          // Internal reference to current project
          moduleToResolve = localKey;
          edges = deps[makeKey(localKey)];
          if (!edges) {
            throw new Error(`Internal module not found: ${localKey} (from ${project}:${localKey})`);
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
          throw new Error(`Internal module not found: ${sqlmodule}`);
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
        // Internal reference to current project
        moduleToResolve = localKey;
        edges = deps[makeKey(localKey)];
        if (!edges) {
          throw new Error(`Internal module not found: ${localKey} (from ${project}:${localKey})`);
        }
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
