import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { LaunchQLProject } from '@launchql/core';
import { errors } from '@launchql/types';

/**
 * Prompt user to select a module from available modules in the directory
 */
export async function selectModule(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  message: string,
  cwd: string
): Promise<string> {
  const p = new LaunchQLProject(cwd);
  const m = await p.getModules();
  const modules = m.map(mod => mod.getModuleName());

  if (!modules.length) {
    prompter.close();
    throw errors.NOT_FOUND({}, 'No modules found in the specified directory.');
  }

  const { project } = await prompter.prompt(argv, [{
    type: 'autocomplete',
    name: 'project',
    message,
    options: modules,
    required: true
  }]);

  return project;
}