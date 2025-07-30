import { LaunchQLProject } from '@launchql/core';
import { errors } from '@launchql/types';
import { Logger } from '@launchql/logger';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

/**
 * Handle project selection for operations that need a specific project
 * Returns the selected project name, or undefined if validation fails or no projects exist
 */
export async function selectProject(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  cwd: string,
  operationName: string,
  log?: Logger
): Promise<string | undefined> {
  const project = new LaunchQLProject(cwd);
  const modules = await project.getModules();
  const moduleNames = modules.map(mod => mod.getModuleName());

  // Check if any modules exist
  if (!moduleNames.length) {
    const errorMsg = 'No modules found in the specified directory.';
    if (log) {
      log.error(errorMsg);
      return undefined;
    } else {
      prompter.close();
      throw errors.NOT_FOUND({}, errorMsg);
    }
  }

  // If a specific project was provided, validate it
  if (argv.project) {
    const projectName = argv.project as string;
    if (log) log.info(`Using specified project: ${projectName}`);
    
    if (!moduleNames.includes(projectName)) {
      const errorMsg = `Project '${projectName}' not found. Available projects: ${moduleNames.join(', ')}`;
      if (log) {
        log.error(errorMsg);
        return undefined;
      } else {
        throw errors.NOT_FOUND({}, errorMsg);
      }
    }
    
    return projectName;
  }

  // Interactive selection
  const { project: selectedProject } = await prompter.prompt(argv, [{
    type: 'autocomplete',
    name: 'project',
    message: `Choose a project to ${operationName}`,
    options: moduleNames,
    required: true
  }]);

  if (log) log.info(`Selected project: ${selectedProject}`);
  return selectedProject;
}