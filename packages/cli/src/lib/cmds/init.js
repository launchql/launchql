import { exec } from 'shelljs';
import { prompt } from 'inquirerer';
import {
  skitchPath,
  getAvailableExtensions,
  init,
  initSkitch
} from '@launchql/db-utils';
import { basename, dirname } from 'path';

// sqitch init flipr --uri https://github.com/theory/sqitch-intro/ --engine pg
const username = exec('git config --global user.name', { silent: true }).trim();
const email = exec('git config --global user.email', { silent: true }).trim();

export default async (argv) => {
  if (argv.bare) {
    await initSkitch();
    console.log(`

          |||
         (o o)
     ooO--(_)--Ooo-


  ✨ Great work! Now, try this:

  cd packages/
  mkdir myfirstmodule
  cd myfirstmodule/
  skitch init
  `);

    return;
  }

  await skitchPath();

  const modules = await getAvailableExtensions();

  const questions = [
    {
      name: 'name',
      message: 'project name (e.g., flipr)',
      default: basename(process.cwd()),
      required: true
    },
    {
      name: 'author',
      message: 'project author',
      default: `${username} <${email}>`,
      required: true
    },
    {
      name: 'description',
      message: 'project description',
      default: basename(process.cwd()),
      required: true
    },
    {
      name: 'extensions',
      message: 'which extensions?',
      choices: modules,
      type: 'checkbox',
      default: ['plpgsql', 'uuid-ossp'],
      required: true
    }
  ];

  const { name, description, author, extensions } = await prompt(
    questions,
    argv
  );

  await init({ name, description, author, extensions });

  console.log(`

        |||
       (o o)
   ooO--(_)--Ooo-


✨ ${name} created!

Now try this:

launchql generate

`);
};
