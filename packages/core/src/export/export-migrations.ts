import { PgpmOptions } from '@pgpmjs/types';
import { mkdirSync, rmSync } from 'fs';
import { sync as glob } from 'glob';
import { toSnakeCase } from 'komoji';
import path from 'path';
import { getPgPool } from 'pg-cache';

import { PgpmPackage } from '../core/class/pgpm';
import { SqitchRow, SqlWriteOptions,writeSqitchFiles, writeSqitchPlan } from '../files';
import { exportMeta } from './export-meta';

interface ExportMigrationsToDiskOptions {
  project: PgpmPackage;
  options: PgpmOptions;
  database: string;
  databaseId: string;
  author: string;
  outdir: string;
  schema_names: string[];
  extensionName?: string;
  metaExtensionName: string;
}

interface ExportOptions {
  project: PgpmPackage;
  options: PgpmOptions;
  dbInfo: {
    dbname: string;
    database_ids: string[];
  };
  author: string;
  outdir: string;
  schema_names: string[];
  extensionName?: string;
  metaExtensionName: string;
}

const exportMigrationsToDisk = async ({
  project,
  options,
  database,
  databaseId,
  author,
  outdir,
  schema_names,
  extensionName,
  metaExtensionName
}: ExportMigrationsToDiskOptions): Promise<void> => {
  outdir = outdir + '/';

  const pgPool = getPgPool({
    ...options.pg,
    database
  });

  const db = await pgPool.query(
    `select * from collections_public.database where id=$1`,
    [databaseId]
  );

  const schemas = await pgPool.query(
    `select * from collections_public.schema where database_id=$1`,
    [databaseId]
  );

  if (!db?.rows?.length) {
    console.log('NO DATABASES.');
    return;
  }

  if (!schemas?.rows?.length) {
    console.log('NO SCHEMAS.');
    return;
  }

  const name = extensionName || db.rows[0].name;

  const { replace, replacer } = makeReplacer({
    schemas: schemas.rows.filter((schema: any) =>
      schema_names.includes(schema.schema_name)
    ),
    name
  });

  const results = await pgPool.query(
    `select * from db_migrate.sql_actions order by id`
  );

  const opts: SqlWriteOptions = {
    name,
    replacer,
    outdir,
    author
  };

  if (results?.rows?.length > 0) {
    await preparePackage({
      project,
      author,
      outdir,
      name,
      extensions: [
        'plpgsql',
        'uuid-ossp',
        'citext',
        'pgcrypto',
        'btree_gist',
        'postgis',
        'hstore',
        'db-meta-schema',
        'launchql-inflection',
        'launchql-uuid',
        'launchql-utils',
        'launchql-database-jobs',
        'launchql-jwt-claims',
        'launchql-stamps',
        'launchql-base32',
        'launchql-totp',
        'launchql-types',
        'launchql-default-roles'
      ]
    });

    writeSqitchPlan(results.rows, opts);
    writeSqitchFiles(results.rows, opts);

    let meta = await exportMeta({
      opts: options,
      dbname: database,
      database_id: databaseId
    });

    meta = replacer(meta);

    await preparePackage({
      project,
      author,
      outdir,
      extensions: ['plpgsql', 'db-meta-schema', 'db-meta-modules'],
      name: metaExtensionName
    });

    const metaReplacer = makeReplacer({
      schemas: schemas.rows.filter((schema: any) =>
        schema_names.includes(schema.schema_name)
      ),
      name: metaExtensionName
    });

    const metaPackage: SqitchRow[] = [
      {
        deps: [],
        deploy: 'migrate/meta',
        content: `SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to collections_public

-- unaccent, postgis affected and require grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

DO $LQLMIGRATION$
  DECLARE
  BEGIN
  
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

${meta}

UPDATE meta_public.apis
      SET dbname = current_database() WHERE TRUE;

UPDATE meta_public.sites
      SET dbname = current_database() WHERE TRUE;

SET session_replication_role TO DEFAULT;
`
      }
    ];

    opts.replacer = metaReplacer.replacer;
    opts.name = metaExtensionName;

    writeSqitchPlan(metaPackage, opts);
    writeSqitchFiles(metaPackage, opts);
  }

  pgPool.end();
};

export const exportMigrations = async ({
  project,
  options,
  dbInfo,
  author,
  outdir,
  schema_names,
  extensionName,
  metaExtensionName
}: ExportOptions): Promise<void> => {
  for (let v = 0; v < dbInfo.database_ids.length; v++) {
    const databaseId = dbInfo.database_ids[v];
    await exportMigrationsToDisk({
      project,
      options,
      extensionName,
      metaExtensionName,
      database: dbInfo.dbname,
      databaseId,
      schema_names,
      author,
      outdir
    });
  }
};


interface PreparePackageOptions {
  project: PgpmPackage;
  author: string;
  outdir: string;
  name: string;
  extensions: string[];
}

interface Schema {
  name: string;
  schema_name: string;
}

interface MakeReplacerOptions {
  schemas: Schema[];
  name: string;
}

interface ReplacerResult {
  replacer: (str: string, n?: number) => string;
  replace: [RegExp, string][];
}

/**
 * Creates a Sqitch package directory or resets the deploy/revert/verify directories if it exists.
 */
const preparePackage = async ({
  project,
  author,
  outdir,
  name,
  extensions
}: PreparePackageOptions): Promise<void> => {
  const curDir = process.cwd();
  const sqitchDir = path.resolve(path.join(outdir, name));
  mkdirSync(sqitchDir, { recursive: true });
  process.chdir(sqitchDir);

  const plan = glob(path.join(sqitchDir, 'pgpm.plan'));
  if (!plan.length) {
    await project.initModule({
      name,
      description: name,
      author,
      extensions,
    });
  } else {
    rmSync(path.resolve(sqitchDir, 'deploy'), { recursive: true, force: true });
    rmSync(path.resolve(sqitchDir, 'revert'), { recursive: true, force: true });
    rmSync(path.resolve(sqitchDir, 'verify'), { recursive: true, force: true });
  }

  process.chdir(curDir);
};

/**
 * Generates a function for replacing schema names and extension names in strings.
 */
const makeReplacer = ({ schemas, name }: MakeReplacerOptions): ReplacerResult => {
  const replacements: [string, string] = ['launchql-extension-name', name];
  const schemaReplacers: [string, string][] = schemas.map((schema) => [
    schema.schema_name,
    toSnakeCase(`${name}_${schema.name}`)
  ]);

  const replace: [RegExp, string][] = [...schemaReplacers, replacements].map(
    ([from, to]) => [new RegExp(from, 'g'), to]
  );

  const replacer = (str: string, n = 0): string => {
    if (!str) return '';
    if (replace[n] && replace[n].length === 2) {
      return replacer(str.replace(replace[n][0], replace[n][1]), n + 1);
    }
    return str;
  };

  return { replacer, replace };
};
