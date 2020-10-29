import {
  sqitchPath as path,
  packageModule,
  writePackage
} from '@launchql/db-utils';
import { prompt } from 'inquirerer';

export default async (argv) => {
  const sqitchPath = await path();
  const pkgPath = `${sqitchPath}/package.json`;
  const pkg = require(pkgPath);

  // const questions = [
  //   {
  //     name: 'version',
  //     message: 'version',
  //     default: pkg.version,
  //     required: true
  //   }
  // ];

  // const { version } = await prompt(questions, argv);
  await writePackage(pkg.version, true);
};
