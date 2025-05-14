import { CLIOptions, Inquirerer, OptionValue, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { LaunchQLProject } from '@launchql/migrate';

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const { cwd = process.cwd() } = argv;

  const project = new LaunchQLProject(cwd);
  await project.init();

  if (!project.isInModule()) {
    throw new Error('You must run this command inside a LaunchQL module.');
  }

  const info = project.getModuleInfo();
  const installed = project.getRequiredModules();
  const available = project.getAvailableModules();
  const filtered = available.filter(name => name !== info.extname);

  const questions: Question[] = [
    {
      name: 'modules',
      message: 'Which modules does this one depend on?',
      type: 'checkbox',
      options: filtered,
      default: installed
    }
  ];

  const answers = await prompter.prompt(argv, questions);
  const selected = (answers.modules as OptionValue[])
    .filter(opt => opt.selected)
    .map(opt => opt.name);

  project.writeModuleMetadataFiles(selected);
};
