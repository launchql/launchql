import { getRootPgPool } from '@launchql/server-utils';
import { preparePackage, makeReplacer } from './utils';
import { exportMeta } from './export';
import { writeSqitchFiles, writeSqitchPlan } from './sqitch';

const write = async ({
  database,
  databaseId,
  author,
  outdir,
  schema_names,
  extensionName,
  metaExtensionName
}) => {
  outdir = outdir + '/';

  const pgPool = getRootPgPool(database);

  const db = await pgPool.query(
    `select * from collections_public.database
        where id=$1`,
    [databaseId]
  );

  const schemas = await pgPool.query(
    `select * from collections_public.schema
        where database_id=$1`,
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

  const name = extensionName ? extensionName : db.rows[0].name;

  // filter only schemas that were selected for replacement
  const { replace, replacer } = makeReplacer({
    schemas: schemas.rows.filter((schema) =>
      schema_names.includes(schema.schema_name)
    ),
    name
  });

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
    await preparePackage({
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
        'db_meta',
        'launchql-inflection',
        'launchql-uuid',
        'launchql-utils',
        'launchql-ext-jobs',
        'launchql-jwt-claims',
        'launchql-stamps',
        'launchql-base32',
        'launchql-totp',
        'launchql-ext-types',
        'launchql-ext-default-roles'
      ]
    });
    writeSqitchPlan(results.rows, opts);
    writeSqitchFiles(results.rows, opts);

    // BEGIN META

    let meta = await exportMeta({
      dbname: database,
      database_id: databaseId
    });

    // replace the inner goods with the schema from above!
    meta = replacer(meta);

    await preparePackage({
      author,
      outdir,
      extensions: ['plpgsql', 'db_meta', 'db_meta_modules'],
      name: metaExtensionName
    });

    const metaReplacer = makeReplacer({
      schemas: schemas.rows.filter((schema) =>
        schema_names.includes(schema.schema_name)
      ),
      name: metaExtensionName
    });

    const metaPackage = [
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

export const migrate = async ({
  dbInfo,
  author,
  outdir,
  schema_names,
  extensionName,
  metaExtensionName
}) => {
  // we really only support one db.... loop iteration of 1
  for (let v = 0; v < dbInfo.database_ids.length; v++) {
    const databaseId = dbInfo.database_ids[v];
    await write({
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
