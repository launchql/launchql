import { exec } from 'shelljs';
import { prompt } from 'inquirerer';
import { pg as pgGen } from 'graphile-gen-js';
import { introspect, introspectionResultsFromRaw } from 'introspectron';
import { resolve } from 'path';
import { PGUSER, PGPASSWORD, PGHOST, PGPORT } from '@launchql/db-env';
import inflection from 'inflection';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const pg = require('pg');
const getDbString = (db) =>
  `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${db}`;

const getDb = (dbname) => {
  return new pg.Pool({
    connectionString: getDbString(dbname)
  });
};

const getFilename = (key, convention) => {
  switch (convention) {
    case 'underscore':
      return inflection.underscore(key);
    case 'dashed':
      return inflection.underscore(key).replace(/_/g, '-');
    case 'camelUpper':
      return inflection.camelize(key, false);
    default:
      return key;
  }
};

export default async (argv) => {
  const d = getDb('postgres');

  const { rows } = await d.query(`
  SELECT
  datname
FROM
  pg_catalog.pg_database
where datistemplate = False
and datname != 'postgres'
and datname !~ '^pg_';
  `);

  const { database } = await prompt(
    [
      {
        name: 'database',
        message: 'database',
        choices: rows.map((db) => db.datname),
        type: 'list',
        required: true
      }
    ],
    argv
  );

  const pgPool = getDb(database);

  const results = await pgPool.query(`
  SELECT s.nspname AS table_schema
  FROM pg_catalog.pg_namespace s
  WHERE
  s.nspname !~ '^pg_' AND
  s.nspname not in ('information_schema');
  `);

  const { schemas } = await prompt(
    [
      {
        name: 'schemas',
        message: 'schemas',
        choices: results.rows.map((s) => s.table_schema),
        type: 'checkbox',
        required: true
      }
    ],
    argv
  );

  const raw = await introspect(pgPool, {
    schemas
  });
  const introspectron = introspectionResultsFromRaw(raw);

  const obj = pgGen.crudify(introspectron);
  const pth = path.join(process.cwd(), 'codegen', database);
  mkdirp.sync(pth);

  const { convention } = await prompt(
    [
      {
        name: 'convention',
        message: 'convention',
        choices: ['underscore', 'dashed', 'camelcase', 'camelUpper'],
        type: 'list',
        required: true
      }
    ],
    argv
  );

  const indexJs = [];
  Object.keys(obj).forEach((key) => {
    const code = `import gql from 'graphql-tag';

${obj[key]}
    `;

    const filename = getFilename(key, convention) + '.js';
    fs.writeFileSync(path.join(pth, filename), code);
    indexJs.push(`export * from './${filename}';`);
  });
  fs.writeFileSync(path.join(pth, 'index.js'), indexJs.sort().join('\n'));

  //   console.log({ introspectron });
  //   console.log({ schemas });
  //   console.log({ obj });

  pgPool.end();
  d.end();

  console.log(`

          |||
         (o o)
     ooO--(_)--Ooo-

  ✨ finished!
  `);
};
