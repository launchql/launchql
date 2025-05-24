import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { basename, dirname, relative } from 'path';

export interface Module {
  path: string;
  requires: string[];
  version: string;
}

export type ModuleMap = Record<string, Module>;

/**
 * Parse a .control file and extract its metadata.
 */
const parseControlFile = (filePath: string, basePath: string): Module => {
  const contents = readFileSync(filePath, 'utf-8');
  const key = basename(filePath).split('.control')[0];
  const requires = contents
    .split('\n')
    .find((line) => /^requires/.test(line))
    ?.split('=')[1]
    .split(',')
    .map((req) => req.replace(/[\'\s]*/g, '').trim()) || [];

  const version = contents
    .split('\n')
    .find((line) => /^default_version/.test(line))
    ?.split('=')[1]
    .replace(/[\']*/g, '')
    .trim() || '';

  return {
    path: dirname(relative(basePath, filePath)),
    requires,
    version,
  };
};

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
 * Get the latest change from the sqitch.plan file for a specific module.
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

  const plan = readFileSync(`${basePath}/${module.path}/sqitch.plan`, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return plan[plan.length - 1].split(' ')[0];
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

  const plan = readFileSync(`${basePath}/${module.path}/sqitch.plan`, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const change = plan[plan.length - 1].split(' ')[0];
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
