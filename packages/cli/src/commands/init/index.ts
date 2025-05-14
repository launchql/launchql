import { CLIOptions, Inquirerer } from 'inquirerer';
import runWorkspaceSetup from './workspace';
import runModuleSetup from './module';

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  return handlePromptFlow(argv, prompter);
};

async function handlePromptFlow(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const { workspace } = argv;

  switch (workspace) {
    case true:
      return runWorkspaceSetup(argv, prompter);
    case false:
    default:
      return runModuleSetup(argv, prompter);
  }
}
