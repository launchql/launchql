import { PgpmPackage } from '@pgpmjs/core';
import { CLIOptions, Inquirerer, OptionValue, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const extensionUsageText = `
Extension Command:

  pgpm extension [OPTIONS]

  Manage module dependencies.

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm extension           Manage dependencies for current module
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(extensionUsageText);
    process.exit(0);
  }
  const { cwd = process.cwd() } = argv;

  const project = new PgpmPackage(cwd);

  if (!project.isInModule()) {
    throw new Error('You must run this command inside a PGPM module.');
  }

  const info = project.getModuleInfo();
  const installed = project.getRequiredModules();
  const available = project.getAvailableModules();
  const filtered = available.filter(name => name !== info.extname);

  const questions: Question[] = [
    {
      name: 'extensions',
      message: 'Which modules does this one depend on?',
      type: 'checkbox',
      allowCustomOptions: true,
      options: filtered,
      default: installed
    }
  ];

  const answers = await prompter.prompt(argv, questions);
  const selected = (answers.extensions as OptionValue[])
    .filter(opt => opt.selected)
    .map(opt => opt.name);

  project.setModuleDependencies(selected);
};
