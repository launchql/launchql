import { join } from 'path';

import { getDeps } from './deps';
import { getExtensionName } from './extensions';
import { getExtensionsAndModulesChanges,listModules } from './modules';

interface PlanOptions {
  name: string;
  uri?: string;
  projects?: boolean;
}

interface ExtensionRequirement {
  name: string;
  latest: string;
}

/**
 * Generate a Sqitch plan file for a package directory.
 * 
 * @param packageDir - The directory containing the package.
 * @param options - Options for generating the plan.
 * @returns A string representing the Sqitch plan.
 */

// @deprecate (using class now)
export const makePlan = async (workspaceDir: string, packageDir: string, options: PlanOptions): Promise<string> => {
  const { name, uri, projects } = options;
  if (!name) {
    throw new Error('Plans require a project name.');
  }

  const now = process.env.NODE_ENV === 'test' ? '2017-08-11T08:11:51Z' : new Date().toISOString();
  const planfile: string[] = [];

  planfile.push(`%syntax-version=1.0.0
%project=${name}
%uri=${uri || name}
  `);

  const modules = listModules(workspaceDir);
  const extname = getExtensionName(packageDir);
  const { resolved, deps } = await getDeps(packageDir, extname);

  const externalReqs: ExtensionRequirement[] = [];

  if (projects) {
    const results = await getExtensionsAndModulesChanges(name, modules, workspaceDir);
    externalReqs.push(...results.sqitch);
  }

  const makeKey = (sqlmodule: string): string => `/deploy/${sqlmodule}.sql`;

  if (resolved.length) {
    deps[makeKey(resolved[0])]?.push(
      ...externalReqs.map((req) => `${req.name}:${req.latest}`)
    );
  }

  resolved.forEach((res) => {
    if (/:/.test(res)) return;

    const dependencies = deps[makeKey(res)];
    if (dependencies?.length) {
      planfile.push(
        `${res} [${dependencies.join(
          ' '
        )}] ${now} skitch <skitch@5b0c196eeb62> # add ${res}`
      );
    } else {
      planfile.push(`${res} ${now} skitch <skitch@5b0c196eeb62> # add ${res}`);
    }
  });

  return planfile.join('\n');
};


/**
 * Get a Sqitch plan for the given options.
 * 
 * @param options - Options to locate and generate the plan.
 * @returns A string representing the Sqitch plan.
 */
export const getPlan = async (workspaceDir: string, options: PlanOptions): Promise<string> => {
  const modules = await listModules(workspaceDir);
  if (!modules[options.name]) {
    throw new Error(`getPlan() ${options.name} NOT FOUND!`);
  }
  const packageDir = join(
    workspaceDir,
    modules[options.name].path
  );
  return await makePlan(workspaceDir, packageDir, options);
};