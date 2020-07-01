import { exec } from 'shelljs';
import { prompt } from 'inquirerer';
import {
  skitchPath
} from '@launchql/db-utils';

import { resolve } from 'path';
import dbMigrate from '@launchql/db-migrate';

// sqitch init flipr --uri https://github.com/theory/sqitch-intro/ --engine pg
const username = exec('git config --global user.name', { silent: true }).trim();
const email = exec('git config --global user.email', { silent: true }).trim();

export default async (argv) => {
  const pth = await skitchPath();

  const questions = [
    {
      name: 'database',
      message: 'database',
      required: true
    },
    {
      name: 'database_id',
      message: 'database_id',
      required: true
    },
    {
        name: 'author',
        message: 'project author',
        default: `${username} <${email}>`,
        required: true
    }
  ];

  const { database, database_id, author } = await prompt(
    questions,
    argv
  );

  await dbMigrate({ database, database_id, author, outdir: resolve(pth + '/packages/') });

  console.log(`

        |||
       (o o)
   ooO--(_)--Ooo-


✨ finished!
`);
};
