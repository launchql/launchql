import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getAvailableModules } from '@launchql/migrate';
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
  const modules = await getAvailableModules(cwd);
  
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