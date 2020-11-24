import {
  build,
  listModules,
  sqitchPath as path,
  skitchPath as sPath,
  writePackage
} from '@launchql/db-utils';

import { prompt } from 'inquirerer';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const single = async (argv) => {
  const sqitchPath = await path();
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);

  const questions = [
    {
      name: 'version',
      message: 'version',
      default: pkg.version,
      required: true
    }
  ];

  const { version } = await prompt(questions, argv);
  await writePackage({ version, extension: false });
};

const all = async (argv) => {
  const skitchPath = await sPath();
  const modules = await listModules();

  const questions = [
    {
      _: true,
      type: 'list',
      name: 'project',
      message: 'choose a project',
      choices: Object.keys(modules),
      required: true
    },
    {
      _: true,
      name: 'path',
      message: 'choose a name',
      filter: (val) => {
        val = /.sql$/.test(val) ? val : val + '.sql';
        if (!/^\//.test(val)) val = resolve(process.cwd() + '/' + val);
        return val;
      },
      required: true
    }
  ];

  const { project, path } = await prompt(questions, argv);

  const sql = await build(project);

  writeFileSync(path, sql);
};

export default async (argv) => {
  const questions = [
    {
      type: 'confirm',
      name: 'deps',
      message: 'dump all dependencies too?',
      required: true
    }
  ];

  const { deps } = await prompt(questions, argv);
  if (deps) {
    await all(argv);
  } else {
    await single(argv);
  }
};
