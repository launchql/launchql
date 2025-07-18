import { sync as glob } from 'glob';
import { basename } from 'path';
import { getLatestChange, parseControlFile, Module } from '../files';

export type ModuleMap = Record<string, Module>;

/**
 * List all modules by parsing .control files in the provided directory.
 */
export const listModules = (workspaceDir: string): ModuleMap => {
  const moduleFiles = glob(`${workspaceDir}/**/*.control`).filter(
    (file: string) => !/node_modules/.test(file)
  );

  return moduleFiles.reduce<ModuleMap>((acc: ModuleMap, file: string) => {
    const module = parseControlFile(file, workspaceDir);
    acc[basename(file).split('.control')[0]] = module;
    return acc;
  }, {});
};

/**
 * Get the latest change from the launchql.plan file for a specific module.
 */
export const latestChange = (
  sqlmodule: string,
  modules: ModuleMap,
  basePath: string
): string => {
  const module = modules[sqlmodule];
  if (!module) {
    throw new Error(`latestChange() ${sqlmodule} NOT FOUND!`);
  }

  const planPath = `${basePath}/${module.path}/launchql.plan`;
  return getLatestChange(planPath);
};

/**
 * Get the latest change and version for a specific module.
 */
export const latestChangeAndVersion = (
  sqlmodule: string,
  modules: ModuleMap,
  basePath: string
): { change: string; version: string } => {
  const module = modules[sqlmodule];
  if (!module) {
    throw new Error(`latestChangeAndVersion() ${sqlmodule} NOT FOUND!`);
  }

  const planPath = `${basePath}/${module.path}/launchql.plan`;
  const change = getLatestChange(planPath);
  const pkg = require(`${basePath}/${module.path}/package.json`);

  return { change, version: pkg.version };
};

/**
 * Get extensions and modules required by a specific module.
 */
export const getExtensionsAndModules = (
  sqlmodule: string,
  modules: ModuleMap
): { native: string[]; sqitch: string[] } => {
  const module = modules[sqlmodule];
  if (!module) {
    throw new Error(`getExtensionsAndModules() ${sqlmodule} NOT FOUND!`);
  }

  const native = module.requires.filter(
    (req) => !Object.keys(modules).includes(req)
  );
  const sqitch = module.requires.filter((req) =>
    Object.keys(modules).includes(req)
  );

  return { native, sqitch };
};

/**
 * Get extensions and modules with their latest changes and versions.
 */
export const getExtensionsAndModulesChanges = (
  sqlmodule: string,
  modules: ModuleMap,
  basePath: string
): {
  native: string[];
  sqitch: { name: string; latest: string; version: string }[];
} => {
  const { native, sqitch } = getExtensionsAndModules(sqlmodule, modules);

  const sqitchWithDetails = 
    sqitch.map( (mod) => {
      const { change, version } = latestChangeAndVersion(mod, modules, basePath);
      return { name: mod, latest: change, version };
    });

  return { native, sqitch: sqitchWithDetails };
};
