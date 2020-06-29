import { prompt } from 'inquirerer';
import { install, installPackage } from '@launchql/db-utils';

const questions = [
  {
    _: true,
    name: 'moduleinfo',
    message: 'modulename@version',
    filter: (val) => (/@/.test(val) ? val.split('@') : [val, 'latest']),
    required: true
  }
];

const noArgs = (argv, cmd) =>
  (Object.keys(argv).length === 1 && !argv._.length) ||
  (Object.keys(argv).length === 2 && !argv._.length && argv.cmd === cmd);

export default async (argv) => {
  // "skitch install"
  if (noArgs(argv, 'install')) {
    await install();
    return;
  }

  // "skitch module@version"
  const {
    moduleinfo: [name, version]
  } = await prompt(questions, argv);
  await installPackage(name, version);
};
