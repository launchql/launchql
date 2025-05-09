import { execSync } from '@launchql/db-utils';
import { prompt } from 'inquirerer';

const questions = [
  {
    _: true,
    name: 'db',
    message: 'database',
    required: true
  }
];
export default async (argv) => {
  const { db } = await prompt(questions, argv);
  execSync(`createdb ${db}`);
};
