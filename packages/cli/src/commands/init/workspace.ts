import { Inquirerer, Question } from 'inquirerer';
import chalk from 'chalk';
import * as mkdirp from 'mkdirp';
import path from 'path';
import { 
  writeRenderedTemplates,
  workspaceTemplate
} from '@launchql/templatizer';
import { sluggify } from '@launchql/migrate';

export default async function runWorkspaceSetup(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const workspaceQuestions: Question[] = [
    {
      name: 'name',
      message: 'Enter workspace name',
      required: true,
      type: 'text',
    }
  ];

  const answers = await prompter.prompt(argv, workspaceQuestions);
  const { cwd } = argv;
  const targetPath = path.join(cwd!, sluggify(answers.name));

  mkdirp.sync(targetPath);
  console.log(chalk.green(`Created workspace directory: ${targetPath}`));

  writeRenderedTemplates(workspaceTemplate, targetPath, { ...argv, ...answers });
  return { ...argv, ...answers, cwd: targetPath };
}
