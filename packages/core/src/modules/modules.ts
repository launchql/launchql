import { getLatestChange, Module } from '../files';
import { errors } from '@pgpmjs/types';

export type ModuleMap = Record<string, Module>;

/**
 * Get the latest change from the pgpm.plan file for a specific module.
 */
export const latestChange = (
  sqlmodule: string,
  modules: ModuleMap,
  basePath: string
): string => {
  const module = modules[sqlmodule];
  if (!module) {
    throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
  }

  const planPath = `${basePath}/${module.path}/pgpm.plan`;
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
    throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
  }

  const planPath = `${basePath}/${module.path}/pgpm.plan`;
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
    throw errors.MODULE_NOT_FOUND({ name: sqlmodule });
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
