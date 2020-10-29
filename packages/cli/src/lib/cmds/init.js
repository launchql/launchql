import { exec } from 'shelljs';
import { getLicense, LICENSE, MIT } from '../license';
import { prompt } from 'inquirerer';
import { basename } from 'path';
import { writeFileSync } from 'fs';
import {
  skitchPath,
  getAvailableExtensions,
  init,
  initSkitch
} from '@launchql/db-utils';

// sqitch init flipr --uri https://github.com/theory/sqitch-intro/ --engine pg
const username = exec('git config --global user.name', { silent: true }).trim();
const email = exec('git config --global user.email', { silent: true }).trim();

export default async (argv) => {
  if (argv.bare) {
    await initSkitch();

    const { entity } = await prompt(
      [
        {
          name: 'entity',
          message: 'your name or company name',
          required: true
        }
      ],
      []
    );

    const lic = await getLicense(entity, email);

    writeFileSync('LICENSE', lic);

    console.log(`

          |||
         (o o)
     ooO--(_)--Ooo-


  ✨ Great work! Now, try this:

  cd packages/
  mkdir mymodule
  cd mymodule/
  lql init
  `);

    return;
  }

  await skitchPath();

  const modules = await getAvailableExtensions();

  const questions = [
    {
      name: 'name',
      message: `package name (e.g., ${basename(process.cwd())})`,
      default: basename(process.cwd()),
      required: true
    },
    {
      name: 'entity',
      message: 'your name or company name',
      default: username,
      required: true
    },
    {
      name: 'npmname',
      message: 'your npm username',
      required: true
    },
    {
      name: 'useremail',
      message: 'project email',
      default: email,
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
      default: ['plpgsql'],
      required: true
    },
    {
      type: 'confirm',
      name: 'scoped',
      message: 'use private scopes? (@username/pkg)',
      required: true
    }
  ];

  const {
    name,
    description,
    entity,
    npmname,
    useremail,
    extensions,
    scoped
  } = await prompt(questions, argv);

  const author = `${entity} <${useremail}>`;

  const lic = await getLicense(entity, useremail);

  await init({
    name,
    description,
    author,
    extensions,
    scoped,
    username: npmname
  });

  writeFileSync('LICENSE', lic);

  console.log(`

        |||
       (o o)
   ooO--(_)--Ooo-


✨ ${name} created!

Now try this:

> lql generate 

or the shortcut:

> lql g 

`);
};
