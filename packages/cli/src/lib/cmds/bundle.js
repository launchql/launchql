import { prompt } from 'inquirerer';
import { exec } from 'child_process';
import { sqitchPath } from '@launchql/db-utils';
import plan from './plan';

const promisify = require('util').promisify;
const fs = require('fs');
const mkdirp = require('mkdirp').sync;
const asyncExec = promisify(exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const path = require('path');
const caseLib = require('case');

export default async (argv) => {
  const PKGDIR = await sqitchPath();

  const pkg = require(`${PKGDIR}/package.json`);

  const questions = [
    {
      _: true,
      type: 'list',
      name: 'modulename',
      message: 'choose a module',
      choices: Object.keys(pkg.dependencies),
      required: true
    },
    {
      _: true,
      name: 'exportedname',
      message: 'exported name (usually same as modulename)',
      required: true
    }
  ];

  let { modulename, exportedname } = await prompt(questions, argv);
  exportedname = caseLib.camel(exportedname);

  mkdirp(`${PKGDIR}/modules`);
  mkdirp(`${PKGDIR}/deploy/schemas/v8/tables/modules/fixtures`);
  mkdirp(`${PKGDIR}/verify/schemas/v8/tables/modules/fixtures`);
  mkdirp(`${PKGDIR}/revert/schemas/v8/tables/modules/fixtures`);

  (async () => {
    const deployFile = fs.createWriteStream(
      `${PKGDIR}/deploy/schemas/v8/tables/modules/fixtures/${exportedname}.sql`
    );
    const revertFile = fs.createWriteStream(
      `${PKGDIR}/revert/schemas/v8/tables/modules/fixtures/${exportedname}.sql`
    );
    const verifyFile = fs.createWriteStream(
      `${PKGDIR}/verify/schemas/v8/tables/modules/fixtures/${exportedname}.sql`
    );

    await asyncExec(
      `browserify ${PKGDIR}/node_modules/${modulename} --s ${exportedname} -o modules/${exportedname}.bundle.js`
    );

    const readStream = fs.createReadStream(
      `${PKGDIR}/modules/${exportedname}.bundle.js`
    );

    // VERIFY
    verifyFile.write(`-- Verify schemas/v8/tables/modules/fixtures/${exportedname}  on pg

  BEGIN;

  SELECT 1/count(*) FROM v8.modules WHERE name='${exportedname}';

  ROLLBACK;`);
    verifyFile.end();

    // REVERT
    revertFile.write(`-- Revert schemas/v8/tables/modules/fixtures/${exportedname} from pg

  BEGIN;

  DELETE FROM v8.modules WHERE name='${exportedname}';

  COMMIT;`);

    revertFile.end();

    // DEPLOYMENT
    deployFile.write(`-- Deploy schemas/v8/tables/modules/fixtures/${exportedname} to pg

  -- requires: schemas/v8/schema
  -- requires: schemas/v8/tables/modules/table

  BEGIN;

  INSERT INTO v8.modules (name, code) VALUES ('${exportedname}', $code$

    (function () {
      var module = {
        exports: { }
      };
      var exports = module.exports;

      /* plv8 bundle begins */
  `);

    readStream.on('data', (chunk) => {});
    readStream.on('end', () => {
      deployFile.write(`

      /* plv8 bundle ends */

      return module;
    })();

  $code$);

  COMMIT;`);

      deployFile.end();
    });
    readStream.pipe(deployFile);

    await plan({});
  })();
};
