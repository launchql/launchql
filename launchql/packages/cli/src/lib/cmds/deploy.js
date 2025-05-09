import { prompt } from 'inquirerer';
import { listModules, deploy, execSync } from '@launchql/db-utils';

const questions = [
  {
    _: true,
    name: 'database',
    message: 'database',
    required: true
  },
  {
    name: 'yes',
    type: 'confirm',
    message: 'are you sure?',
    required: true
  }
];

export default async (argv) => {
  const { database, yes, recursive, createdb } = await prompt(questions, argv);
  if (!yes) return;

  if (argv.createdb) {
    console.log(`createdb ${database}`);
    execSync(`createdb ${database}`);
  }
  if (recursive) {
    const modules = await listModules();
    const { project } = await prompt(
      [
        {
          type: 'list',
          name: 'project',
          message: 'choose a project',
          choices: Object.keys(modules),
          required: true
        }
      ],
      argv
    );
    await deploy(project, database);
  } else {
    console.log(`sqitch deploy db:pg:${database}`);
    execSync(`sqitch deploy db:pg:${database}`);
  }
};
