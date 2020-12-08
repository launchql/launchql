import { getRootPgPool } from '@launchql/server-utils';
import { preparePackage, makeReplacer } from './utils';
import { exportMeta } from './export';
import { writeSqitchFiles, writeSqitchPlan } from './sqitch';

const write = async ({
  database,
  databaseid,
  author,
  outdir,
  extensionName
}) => {
  outdir = outdir + '/';

  const pgPool = getRootPgPool(database);

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
      database_id: databaseid
    });

    // replace the inner goods with the schema from above!
    meta = replacer(meta);

    const metaSchemaPackage = 'meta-schema';

    await preparePackage({
      author,
      outdir,
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
        'launchql-ext-default-roles',
        'launchql-dbs'
      ],
      name: metaSchemaPackage
    });

    const metaReplacer = makeReplacer({
      schemas,
      name: metaSchemaPackage
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

EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

${meta}

SET session_replication_role TO DEFAULT;
`
      }
    ];

    opts.replacer = metaReplacer.replacer;
    opts.name = metaSchemaPackage;
    writeSqitchPlan(metaPackage, opts);
    writeSqitchFiles(metaPackage, opts);
  }

  pgPool.end();
};

export const migrate = async ({ dbInfo, author, outdir, extensionName }) => {
  // we really only support one db.... loop iteration of 1
  for (let v = 0; v < dbInfo.database_ids.length; v++) {
    const databaseid = dbInfo.database_ids[v];
    await write({
      extensionName,
      database: dbInfo.dbname,
      databaseid,
      author,
      outdir
    });
  }
};
