import { getRootPgPool } from '@launchql/server-utils';
import { preparePackage, makeReplacer } from './utils';
import { exportMeta } from './export';
import { writeSqitchFiles, writeSqitchPlan } from './sqitch';

const write = async ({
  database,
  databaseId,
  author,
  outdir,
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

  const { replace, replacer } = makeReplacer({
    schemas,
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
        'launchql-inflection',
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
      extensions: ['plpgsql', 'db_meta'],
      name: metaExtensionName
    });

    const metaReplacer = makeReplacer({
      schemas,
      name: metaExtensionName
    });

    const metaPackage = [
      {
        deps: [],
        deploy: 'migrate/meta',
        content: `SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to collections_public

GRANT SELECT ON collections_public.database TO administrator;
GRANT SELECT ON collections_public.schema TO administrator;
GRANT SELECT ON collections_public.table TO administrator;

GRANT SELECT ON meta_public.domains TO administrator;
GRANT SELECT ON meta_public.apis TO administrator;
GRANT SELECT ON meta_public.apps TO administrator;
GRANT SELECT ON meta_public.sites TO administrator;
GRANT SELECT ON meta_public.api_modules TO administrator;
GRANT SELECT ON meta_public.site_modules TO administrator;
GRANT SELECT ON meta_public.site_themes TO administrator;
GRANT SELECT ON meta_public.site_metadata TO administrator;

DO $LQLMIGRATION$
  DECLARE
  BEGIN
  
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

${meta}

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
      author,
      outdir
    });
  }
};
