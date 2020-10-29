import pg from 'pg';
import env from './env';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Case from 'case';
import rimraf from 'rimraf';
import moment from 'moment';
import makeSvc from './service';

import { init } from '@launchql/db-utils';

const write = async ({ database, databaseid, author, outdir, initialize }) => {
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

  const ordered = (arr) => {
    if (!arr) return [];
    return arr.sort((a, b) => {
      return (
        a.length - b.length || a.localeCompare(b) // sort by length, if equal then
      ); // sort by dictionary order
    });
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
  ordered(row?.deps)
    .map((dep) => `-- requires: ${dep}`)
    .join('\n') || ''
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

  const db = await pgPool.query(
    `select * from collections_public.database
        where id=$1`,
    [databaseid]
  );

  const schemas = await pgPool.query(
    `select * from collections_public.schema
        where database_id=$1`,
    [databaseid]
  );

  const svcs = await pgPool.query(
    `select * from services_public.services
        where database_id=$1`,
    [databaseid]
  );

  if (!db?.rows?.length) {
    console.log('NO DATABASES.');
    return;
  }

  if (!schemas?.rows?.length) {
    console.log('NO SCHEMAS.');
    return;
  }

  const name = db.rows[0].name;
  const schema_name = db.rows[0].schema_name;
  const private_schema_name = db.rows[0].private_schema_name;

  const schemaReplacers = schemas.rows.map((schema) => {
    return [schema.schema_name, Case.snake(name + '_' + schema.name)];
  });

  const replace = [...schemaReplacers, ['launchql-extension-name', name]].map(
    ([f, r]) => {
      return [new RegExp(f, 'g'), r];
    }
  );

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
    const curDir = process.cwd();
    const sqitchDir = path.resolve(outdir + '/' + name);
    mkdirp.sync(sqitchDir);
    process.chdir(sqitchDir);
    if (initialize) {
      await init({
        name,
        description: name,
        author,
        extensions: [
          'plpgsql',
          'uuid-ossp',
          'citext',
          'pgcrypto',
          'btree_gist',
          'postgis',
          'hstore'
        ]
      });
    } else {
      // until we fix the migrations and/or redeploy our app
      rimraf.sync(path.resolve(sqitchDir + '/deploy'));
      rimraf.sync(path.resolve(sqitchDir + '/revert'));
      rimraf.sync(path.resolve(sqitchDir + '/verify'));
    }

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
    writeSqitchStuff(results.rows, opts);
    writeResults(results.rows, opts);
  }

  pgPool.end();
};

export default async ({ dbInfo, author, outdir, init }) => {
  for (let v = 0; v < dbInfo.database_ids.length; v++) {
    const databaseid = dbInfo.database_ids[v];
    await write({
      initialize: init,
      database: dbInfo.dbname,
      databaseid,
      author,
      outdir
    });
  }
};
