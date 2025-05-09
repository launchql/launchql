import { sqitchPath as path, writePackage } from '@launchql/db-utils';
import { prompt } from 'inquirerer';

export default async (argv) => {
  // do --no-plan and you can set this to false
  // hacky but we don't want to interupt
  if (!argv.hasOwnProperty('plan')) {
    argv.plan = true;
  }

  const sqitchPath = await path();
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);

  const questions = [
    {
      name: 'plan',
      message: 'use plan',
      default: true
    }
  ];

  const { plan } = await prompt(questions, argv);
  await writePackage({ version: pkg.version, extension: true, usePlan: plan });
};
