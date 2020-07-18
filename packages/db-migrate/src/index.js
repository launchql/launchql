import pg from 'pg';
import env from './env';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Case from 'case';
import moment from 'moment';
import makeSvc from './service';

import { init } from '@launchql/db-utils';

const write = async ({ database, databaseid, author, outdir }) => {
  outdir = outdir + '/';

  const getDbString = (db) =>
    `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

  const pgPool = new pg.Pool({
    connectionString: getDbString(database)
  });

  const writeResults = (rows, opts) => {
    rows.forEach((row) => writeVerify(row, opts));
    rows.forEach((row) => writeRevert(row, opts));
    rows.forEach((row) => writeDeploy(row, opts));
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

${opts.replacer(
  row?.deps?.map((dep) => `-- requires: ${dep}`).join('\n') || ''
)}

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
${opts.replacer(row.verify)}
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
${opts.replacer(row.revert)}
COMMIT;  

`;
    fs.writeFileSync(actualFile, content);
  };

  const writeSqitchStuff = (rows, opts) => {
    const dir = path.resolve(opts.outdir + opts.name);
    mkdirp.sync(dir);
    const date = () => `2017-08-11T08:11:51Z`;
    // TODO timestamp issue
    //   const date = row => moment(row.created_at).format();
    const duplicates = {};
    const plan = opts.replacer(`%syntax-version=1.0.0
%project=launchql-extension-name
%uri=launchql-extension-name

${rows
  .map((row) => {
    if (duplicates.hasOwnProperty(row.deploy)) {
      console.log('DUPLICATE ' + row.deploy);
      return '';
    } else {
      duplicates[row.deploy] = true;
    }
    if (row.deps?.length > 0) {
      return `${row.deploy} [${row.deps.map((dep) => dep).join(' ')}] ${date(
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

  const svcs = await pgPool.query(
    `select * from services_public.services
        where database_id=$1`,
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
    ['launchql-extension-name', name]
  ].map(([f, r]) => {
    return [new RegExp(f, 'g'), r];
  });

  const replacer = (str, n = 0) => {
    if (!str) return '';
    if (replace[n] && replace[n].length == 2) {
      return replacer(str.replace(replace[n][0], replace[n][1]), n + 1);
    }
    return str;
  };

  let service = null;
  let serviceObj = {};
  if (svcs?.rows?.length) {
    service = makeSvc(svcs.rows);
    serviceObj = svcs.rows.reduce((m, svc) => {
      const { id, name, dbname, is_public, database_id, ...rest } = svc;
      m[svc.subdomain] = JSON.parse(replacer(JSON.stringify(rest)));
      return m;
    }, {});
  }

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
      ALTER USER administrator WITH NOCREATEDB;
      ALTER USER administrator WITH NOSUPERUSER;
      ALTER USER administrator WITH NOCREATEROLE;
      ALTER USER administrator WITH NOLOGIN;
      ALTER USER administrator WITH NOREPLICATION;
      ALTER USER administrator WITH BYPASSRLS;
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'anonymous') THEN
      CREATE ROLE anonymous;
      ALTER USER anonymous WITH NOCREATEDB;
      ALTER USER anonymous WITH NOSUPERUSER;
      ALTER USER anonymous WITH NOCREATEROLE;
      ALTER USER anonymous WITH NOLOGIN;
      ALTER USER anonymous WITH NOREPLICATION;
      ALTER USER anonymous WITH NOBYPASSRLS;
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'authenticated') THEN
      CREATE ROLE authenticated;
      ALTER USER authenticated WITH NOCREATEDB;
      ALTER USER authenticated WITH NOSUPERUSER;
      ALTER USER authenticated WITH NOCREATEROLE;
      ALTER USER authenticated WITH NOLOGIN;
      ALTER USER authenticated WITH NOREPLICATION;
      ALTER USER authenticated WITH NOBYPASSRLS;
   END IF;
   GRANT anonymous TO administrator;
   GRANT authenticated TO administrator;
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
      // {
      //   deploy: 'tags/' + Date.now(),
      //   deps: results.rows.map((row) => row.deploy),
      //   content: ``,
      //   revert: ``,
      //   verify: ``
      // }
    ];

    const curDir = process.cwd();
    const sqitchDir = path.resolve(outdir + '/' + name);
    mkdirp.sync(sqitchDir);
    process.chdir(sqitchDir);
    await init({
      name,
      description: name,
      author,
      extensions: ['plpgsql', 'uuid-ossp', 'citext', 'btree_gist', 'hstore']
    });

    if (service) {
      service = replacer(service);
      const utilsDir = path.resolve(sqitchDir + '/utils');
      mkdirp.sync(utilsDir);
      fs.writeFileSync(utilsDir + '/services.sql', service);
      fs.writeFileSync(
        utilsDir + '/services.json',
        JSON.stringify(serviceObj, null, 2)
      );
    }

    process.chdir(curDir);
    writeSqitchStuff(rows, opts);
    writeResults(rows, opts);
  }

  pgPool.end();
};

export default async ({ dbInfo, author, outdir }) => {
  for (let v = 0; v < dbInfo.database_ids.length; v++) {
    const databaseid = dbInfo.database_ids[v];
    await write({
      database: dbInfo.dbname,
      databaseid,
      author,
      outdir
    });
  }
};
