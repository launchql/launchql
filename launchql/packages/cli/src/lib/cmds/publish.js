const releaseTypes = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease'
];

import { publish, getExtensionName } from '@launchql/db-utils';
import { prompt } from 'inquirerer';

const questions = [
  {
    name: 'release',
    type: 'list',
    message: 'release',
    choices: releaseTypes,
    required: true
  }
];
export default async (argv) => {
  const { release } = await prompt(questions, argv);
  const extname = await getExtensionName();
  await publish(extname, release);
};
