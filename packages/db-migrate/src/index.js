import pg from 'pg';
import env from './env';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Case from 'case';
import moment from 'moment';

const write = async ({ database, databaseid, author, outdir }) => {

  outdir = outdir + '/';

  const getDbString = db =>
    `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

  const pgPool = new pg.Pool({
    connectionString: getDbString(database)
  });

  const writeResults = (rows, opts) => {
    rows.forEach(row => writeVerify(row, opts));
    rows.forEach(row => writeRevert(row, opts));
    rows.forEach(row => writeDeploy(row, opts));
  };

  const writeDeploy = (row, opts) => {
    const deploy = opts.replacer(row.deploy);
    const dir = path.dirname(deploy);
    const prefix = opts.outdir + opts.name + '/deploy/';
    const actualDir = path.resolve(prefix + dir);
    const actualFile = path.resolve(prefix + deploy + '.sql');
    mkdirp.sync(actualDir);
    const content = `-- Deploy: ${deploy} to pg
-- made with <3 @ launchql.com

${opts.replacer(row?.deps?.map(dep => `-- requires: ${dep}`).join('\n') || '')}

BEGIN;
${opts.replacer(row.content)}
COMMIT;
`;
    fs.writeFileSync(actualFile, content);
  };
  const writeVerify = (row, opts) => {
    const deploy = opts.replacer(row.deploy);
    const dir = path.dirname(deploy);
    const prefix = opts.outdir + opts.name + '/verify/';
    const actualDir = path.resolve(prefix + dir);
    const actualFile = path.resolve(prefix + deploy + '.sql');
    mkdirp.sync(actualDir);
    const content = opts.replacer(`-- Verify: ${deploy} on pg

BEGIN;
${row.verify && opts.replacer(row.verify)}
COMMIT;  

`);
    fs.writeFileSync(actualFile, content);
  };

  const writeRevert = (row, opts) => {
    const deploy = opts.replacer(row.deploy);
    const dir = path.dirname(deploy);
    const prefix = opts.outdir + opts.name + '/revert/';
    const actualDir = path.resolve(prefix + dir);
    const actualFile = path.resolve(prefix + deploy + '.sql');
    mkdirp.sync(actualDir);
    const content = `-- Revert: ${deploy} from pg

BEGIN;
${row.revert && opts.replacer(row.revert)}
COMMIT;  

`;
    fs.writeFileSync(actualFile, content);
  };

  const writeSqitchStuff = (rows, opts) => {
    const dir = path.resolve(opts.outdir + opts.name);
    mkdirp.sync(dir);
    const conf = `[core]
    engine=pg
`;
    fs.writeFileSync(dir + '/sqitch.conf', conf);

    const env = `PGDATABASE=testing-db
PGTEMPLATE_DATABASE=testing-template-db
PGHOST=localhost
PGPASSWORD=password
PGPORT=5432
PGUSER=postgres
APP_USER=app_user
APP_PASSWORD=app_password
PGEXTENSIONS=plpgsql,uuid-ossp,citext,btree_gist,hstore
  `;
    fs.writeFileSync(dir + '/.env', env);

    const ctl = opts.replacer(`# launchql-extension-name-replacement extension
comment = 'launchql project'
default_version = '0.0.1'
module_pathname = '$libdir/launchql-extension-name-replacement'
requires = 'plpgsql,uuid-ossp,citext,btree_gist,hstore'
relocatable = false
superuser = false
  `);
    fs.writeFileSync(dir + '/' + opts.name + '.control', ctl);

    const test = opts.replacer(`import * as testing from 'skitch-testing';

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  import * as dotenv from 'dotenv';
  dotenv.config({ path: '.env' });
  
  export const getConnection = async () => {
    return await testing.getTestConnection();
  };
  
  export { closeConnection, getConnections, closeConnections } from 'skitch-testing'   
  `);
    mkdirp.sync(dir + '/test/utils');
    fs.writeFileSync(dir + '/test/utils/index.js', test);

    const mkfl = opts.replacer(`EXTENSION = launchql-extension-name
DATA = sql/launchql-extension-name--0.0.1.sql

PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
    
  `);
  fs.writeFileSync(dir + '/' + 'Makefile', mkfl);

  const blb = opts.replacer(`{
  "plugins": [
    "dynamic-import-node",
    "syntax-dynamic-import",
    "transform-class-properties",
    "transform-object-rest-spread",
    "transform-regenerator",
    "transform-runtime"
  ],
  "presets": ["env"]
}  
`);
  fs.writeFileSync(dir + '/' + '.babelrc', blb);
  const pkg = opts.replacer(`{
  "name": "launchql-extension-name",
  "version": "0.0.1",
  "description": "launchql-extension-name",
  "author": "${opts.author}",
  "private": true,
  "scripts": {
    "test": "FAST_TEST=1 skitch-templatedb && jest",
    "test:watch": "FAST_TEST=1 jest --watch"
  },
  "devDependencies": {
    "@types/jest": "21.1.0",
    "@types/node": "8.0.0",
    "babel-cli": "6.24.1",
    "babel-jest": "20.0.3",
    "babel-preset-react-app": "3.0.0",
    "dotenv": "5.0.1",
    "jest": "20.0.4",
    "skitch-testing": "latest",
    "uuid": "3.1.0"
  }
}
`);
    fs.writeFileSync(dir + '/' + 'package.json', pkg);
    const date = () => `2017-08-11T08:11:51Z`;
    // TODO timestamp issue
    //   const date = row => moment(row.created_at).format();

    const duplicates = {};

    const plan = opts.replacer(`%syntax-version=1.0.0
%project=launchql-extension-name-replacement
%uri=launchql-extension-name-replacement

${rows
        .map(row => {
          if (duplicates.hasOwnProperty(row.deploy)) {
            console.log('DUPLICATE ' + row.deploy);
            return '';
          } else {
            duplicates[row.deploy] = true;
          }
          if (row.deps?.length > 0) {
            return `${row.deploy} [${row.deps.map(dep => dep).join(' ')}] ${date(
              row
            )} launchql <launchql@5b0c196eeb62> # add ${row.name}`;
          }
          return `${row.deploy} ${date(row)} launchql <launchql@5b0c196eeb62> # add ${
            row.name
            }`;
        })
        .join('\n')}
`);

    fs.writeFileSync(dir + '/sqitch.plan', plan);
  };

  const dbname = await pgPool.query(
    `select * from collections_public.database
        where id=$1`,
    [databaseid]
  );

  if (!dbname?.rows?.length) {
    console.log('NO DATABASES.');
    return;
  }

  const name = dbname.rows[0].name;
  const schema_name = dbname.rows[0].schema_name;
  const private_schema_name = dbname.rows[0].private_schema_name;

  const replace = [
    [schema_name, Case.snake(name + '_public')],
    [private_schema_name, Case.snake(name + '_private')],
    ['launchql-extension-name-replacement', name]
  ].map(([f, r]) => {
    return [new RegExp(f, 'g'), r];
  });

  const replacer = (str, n = 0) => {
    if (replace[n] && replace[n].length == 2) {
      return replacer(str.replace(replace[n][0], replace[n][1]), n + 1);
    }
    return str;
  };

  const results = await pgPool.query(
    `select * from db_migrate.sql_actions order by id`
  );
  const opts = {
    name,
    replace,
    replacer,
    outdir,
    author
  };
  if (results?.rows?.length > 0) {
    const rows = [
      {
        deploy: 'roles/init',
        content: `DO    
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'administrator') THEN
      CREATE ROLE administrator;
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'anonymous') THEN
      CREATE ROLE anonymous;
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'authenticated') THEN
      CREATE ROLE authenticated;
   END IF;
END
$do$;        
            `,
        revert: ``,
        verify: ``
      },
      {
        deploy: 'extensions/init',
        content: `CREATE EXTENSION IF NOT EXISTS plpgsql;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS hstore;            
            `,
        revert: `
DROP EXTENSION IF EXISTS citext;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS hstore;            
            `,
        verify: ``
      },
      ...results.rows
    ];

    writeSqitchStuff(rows, opts);
    writeResults(rows, opts);
  }

  pgPool.end();
};

export default async ({ dbInfo, author, outdir }) => {
  const databaseid = console.log(dbInfo);
  for (let v=0; v<dbInfo.database_ids.length; v++) {
    const databaseid = dbInfo.database_ids[v];
    await write({database: dbInfo.dbname, databaseid, author, outdir})
  }
};
