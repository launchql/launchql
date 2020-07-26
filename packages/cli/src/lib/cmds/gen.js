import { exec } from 'shelljs';
import { prompt } from 'inquirerer';
import { skitchPath } from '@launchql/db-utils';

import { resolve } from 'path';
import dbMigrate from '@launchql/db-migrate';

import { PGUSER, PGPASSWORD, PGHOST, PGPORT } from '@launchql/db-env';

const pgPromise = require('pg-promise');

// sqitch init flipr --uri https://github.com/theory/sqitch-intro/ --engine pg
const username = exec('git config --global user.name', { silent: true }).trim();
const email = exec('git config --global user.email', { silent: true }).trim();

const initOptions = {
  /* initialization options */
};

const pgp = pgPromise(initOptions);
const DBS = {};
const getDb = (dbname) => {
  if (DBS[dbname]) return DBS[dbname];
  const cn2 = {
    host: PGHOST,
    port: PGPORT,
    database: dbname,
    user: PGUSER,
    password: PGPASSWORD
  };

  const d2 = pgp(cn2); // database instance;
  DBS[dbname] = d2;
  return d2;
};

export default async (argv) => {
  const pth = await skitchPath();
  const d = getDb('postgres');

  const results = await d.any(`
  SELECT
  datname
FROM
  pg_catalog.pg_database
where datistemplate = False
and datname != 'postgres'
and datname !~ '^pg_';
  `);

  console.log(results);

  const { databases } = await prompt(
    [
      {
        name: 'databases',
        message: 'database(s)',
        choices: results.map((db) => db.datname),
        type: 'checkbox',
        required: true
      }
    ],
    argv
  );

  const dbname = databases[0];
  const d2 = getDb(dbname);
  const dbs = await d2.any(`
SELECT
    id, name
    FROM
        collections_public.database;
    `);

  const { database_ids } = await prompt(
    [
      {
        name: 'database_ids',
        message: 'database_id(s)',
        choices: dbs.map((db) => db.name),
        type: 'checkbox',
        required: true
      }
    ],
    {}
  );

  //   console.log(database_ids);

  const dbInfo = {
    dbname: dbname,
    database_ids: database_ids
      .map((name) => {
        return dbs.find((el) => el.name === name);
      })
      .map((o) => o.id)
  };

  // console.log(JSON.stringify(dbInfo, null, 2));

  //     const wdbs = [];
  //     for (let d = 0; d < databases.length; d++) {
  //         console.log('inside');
  //         const dinner = getDb(databases[d]);
  //         const results = await dinner.any(`
  // SELECT
  //     id, name
  //     FROM
  //         collections_public.database;
  //     `);

  //         console.log(results);

  //         const { database_ids } = await prompt(
  //             {
  //                 name: 'database_ids',
  //                 message: 'database_id(s) for ' + databases[d],
  //                 // choices: results.map(db => db.name),
  //                 choices: ['1', '2'],
  //                 type: 'checkbox',
  //                 required: true
  //             },
  //             {}
  //         );

  //         console.log(database_ids)

  //         const dbInfo = {
  //             dbname: databases[d],
  //             database_ids: database_ids.map((name)=> {
  //                 return results.find(el=>el.name===name)
  //             }).map(o=>o.id)
  //         }

  //         wdbs.push(dbInfo)
  //     }

  //     console.log({wbds});

  const { author, init } = await prompt(
    [
      {
        name: 'author',
        message: 'project author',
        default: `${username} <${email}>`,
        required: true
      },
      {
        name: 'init',
        type: 'confirm',
        message: 'initialize new project?',
        required: true
      }
    ],
    argv
  );

  //   console.log({ dbInfo, author, outdir: resolve(pth + '/packages/') });

  await dbMigrate({
    dbInfo,
    author,
    outdir: resolve(pth + '/packages/'),
    init
  });

  console.log(`

        |||
       (o o)
   ooO--(_)--Ooo-


✨ finished!
`);
};
