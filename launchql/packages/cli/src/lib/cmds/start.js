import { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';
import { prompt } from 'inquirerer';
import { sqitchPath } from '@launchql/db-utils';
import * as shell from 'shelljs';
import env from '@launchql/db-env';

export default async (argv) => {
  const path = await sqitchPath();
  const questions = [
    {
      name: 'db',
      message: 'database',
      required: true
    },
    {
      type: 'checkbox',
      name: 'schemas',
      message: 'choose schemas',
      choices: await promisify(readdir)(resolvePath(path + '/deploy/schemas')),
      required: true
    }
  ];
  const { schemas, db } = await prompt(questions, argv);
  const cmd = [
    'postgraphile',
    '--connection',
    `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`,
    '--schema',
    schemas.join(',')
  ].join(' ');
  shell.exec(cmd);
};
