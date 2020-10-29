import { prompt } from 'inquirerer';
import { sqitchPath, makePlan, getExtensionName } from '@launchql/db-utils';
import { basename } from 'path';
const fs = require('fs');

const questions = [
  {
    name: 'name',
    message: 'project name (e.g., flipr)',
    default: basename(process.cwd()),
    required: true
  }
];

export default async (argv) => {
  const PKGDIR = await sqitchPath();

  let name = argv.name;
  if (!name) {
    try {
      name = await getExtensionName(PKGDIR);
    } catch (e) {
      console.log('>');
    }
    if (!name) {
      ({ name } = await prompt(questions, argv));
    }
  }

  const settings = {
    name,
    projects: true
  };

  if (argv.noprojects) {
    settings.projects = false;
  }

  const plan = await makePlan(PKGDIR, settings);

  fs.writeFileSync(`${PKGDIR}/sqitch.plan`, plan);
};
