import { getRootPgPool } from '@launchql/server-utils';
import { Parser } from 'csv-to-pg';

// TODO generate this config via introspection
const config = {
  database: {
    schema: 'collections_public',
    table: 'database',
    fields: {
      id: 'uuid',
      owner_id: 'uuid',
      name: 'text'
    }
  },
  schema: {
    schema: 'collections_public',
    table: 'schema',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      name: 'text',
      schema_name: 'text',
      description: 'text'
    }
  },
  table: {
    schema: 'collections_public',
    table: 'table',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      schema_id: 'uuid',
      name: 'text',
      description: 'text'
    }
  },
  field: {
    schema: 'collections_public',
    table: 'field',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      table_id: 'uuid',
      name: 'text',
      type: 'text',
      description: 'text'
    }
  },
  domains: {
    schema: 'meta_public',
    table: 'domains',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      domain: 'text',
      subdomain: 'text'
    }
  },
  sites: {
    schema: 'meta_public',
    table: 'sites',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      domain_id: 'uuid',
      title: 'text',
      description: 'text',
      og_image: 'image',
      favicon: 'upload',
      apple_touch_icon: 'image',
      logo: 'image',
      dbname: 'text'
    }
  },
  apis: {
    schema: 'meta_public',
    table: 'apis',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      domain_id: 'uuid',
      name: 'text',
      schemas: 'text[]',
      dbname: 'text',
      is_public: 'boolean',
      role_name: 'text',
      anon_role: 'text'
    }
  },
  apps: {
    schema: 'meta_public',
    table: 'apps',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      site_id: 'uuid',
      name: 'text',
      app_image: 'image',
      app_store_link: 'url',
      app_store_id: 'text',
      app_id_prefix: 'text',
      play_store_link: 'url'
    }
  },
  site_modules: {
    schema: 'meta_public',
    table: 'site_modules',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      site_id: 'uuid',
      name: 'text',
      data: 'jsonb'
    }
  },
  site_themes: {
    schema: 'meta_public',
    table: 'site_themes',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      site_id: 'uuid',
      theme: 'jsonb'
    }
  },
  api_modules: {
    schema: 'meta_public',
    table: 'api_modules',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      api_id: 'uuid',
      name: 'text',
      data: 'jsonb'
    }
  }
};

// {
//     "dbInfo": {
//       "dbname": "testing-db-1607217773074",
//       "database_ids": [
//         "95482a0f-ed8e-447d-ab05-318650d2f328"
//       ]
//     }
//   }

export const exportMeta = async ({ dbname, database_id }) => {
  const pool = getRootPgPool(dbname);

  const sql = {};
  const parsers = Object.entries(config).reduce((m, [name, config]) => {
    m[name] = new Parser(config);
    return m;
  }, {});

  const database = await pool.query(
    `SELECT * FROM collections_public.database WHERE id = $1`,
    [database_id]
  );

  sql.database = await parsers.database.parse(database.rows);

  const schema = await pool.query(
    `SELECT * FROM collections_public.schema WHERE database_id = $1`,
    [database_id]
  );
  sql.schema = await parsers.schema.parse(schema.rows);

  //   const table = await pool.query(
  //     `SELECT * FROM collections_public.table WHERE database_id = $1`,
  //     [database_id]
  //   );
  //   sql.table = await parsers.table.parse(table.rows);

  //   const field = await pool.query(
  //     `SELECT * FROM collections_public.field WHERE database_id = $1`,
  //     [database_id]
  //   );

  //   sql.field = await parsers.field.parse(field.rows);

  // META

  const domains = await pool.query(
    `SELECT * FROM meta_public.domains WHERE database_id = $1`,
    [database_id]
  );

  sql.domains = await parsers.domains.parse(domains.rows);

  const apis = await pool.query(
    `SELECT * FROM meta_public.apis WHERE database_id = $1`,
    [database_id]
  );

  sql.apis = await parsers.apis.parse(apis.rows);

  const sites = await pool.query(
    `SELECT * FROM meta_public.sites WHERE database_id = $1`,
    [database_id]
  );

  sql.sites = await parsers.sites.parse(sites.rows);

  const api_modules = await pool.query(
    `SELECT * FROM meta_public.api_modules WHERE database_id = $1`,
    [database_id]
  );

  sql.api_modules = await parsers.api_modules.parse(api_modules.rows);

  const site_modules = await pool.query(
    `SELECT * FROM meta_public.site_modules WHERE database_id = $1`,
    [database_id]
  );

  sql.site_modules = await parsers.site_modules.parse(site_modules.rows);

  const site_themes = await pool.query(
    `SELECT * FROM meta_public.site_themes WHERE database_id = $1`,
    [database_id]
  );

  // TODO fix csv-to-pg not to print when 0 rows in parse
  if (site_themes.rows.length)
    sql.site_themes = await parsers.site_themes.parse(site_themes.rows);

  const apps = await pool.query(
    `SELECT * FROM meta_public.apps WHERE database_id = $1`,
    [database_id]
  );

  if (apps.rows.length) sql.apps = await parsers.apps.parse(apps.rows);

  return Object.entries(sql).reduce((m, [k, v]) => {
    return m + '\n\n' + v;
  }, '');
};
