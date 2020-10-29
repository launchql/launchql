import { prompt } from 'inquirerer';
import { installPackage } from '@launchql/db-utils';

const questions = [
  {
    _: true,
    name: 'pkg',
    message: 'pkgname@version',
    required: true
  }
];

export default async (argv) => {
  const { pkg } = await prompt(questions, argv);
  await installPackage(pkg);
};
