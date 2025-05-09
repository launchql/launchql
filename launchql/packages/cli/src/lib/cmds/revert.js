import { prompt } from 'inquirerer';
import { listModules, revert, execSync } from '@launchql/db-utils';

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
  const { database, yes, recursive } = await prompt(questions, argv);
  if (!yes) return;

  if (recursive) {
    const modules = await listModules();
    const { name } = await prompt(
      [
        {
          type: 'list',
          name: 'name',
          message: 'choose a project',
          choices: Object.keys(modules),
          required: true
        }
      ],
      {}
    );
    await revert(name, database);
  } else {
    console.log(`sqitch revert db:pg:${database} -y`);
    execSync(`sqitch revert db:pg:${database} -y`);
  }
};
