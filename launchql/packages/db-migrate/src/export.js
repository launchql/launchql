import { getRootPgPool } from '@launchql/server-utils';
import { Parser } from 'csv-to-pg';

// TODO generate this config via introspection
const config = {
  // extensions: {
  //   schema: 'collections_public',
  //   table: 'extension',
  //   fields: {
  //     name: 'text',
  //     public_schemas: 'text[]',
  //     private_schemas: 'text[]'
  //   }
  // },
  // NOTE: for now, the extensions are baked into the extension itself!
  database: {
    schema: 'collections_public',
    table: 'database',
    fields: {
      id: 'uuid',
      owner_id: 'uuid',
      name: 'text',
      hash: 'uuid'
    }
  },
  database_extension: {
    schema: 'collections_public',
    table: 'database_extensions',
    fields: {
      name: 'text',
      database_id: 'uuid'
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
      site_id: 'uuid',
      api_id: 'uuid',
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
      name: 'text',
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
  },
  api_extensions: {
    schema: 'meta_public',
    table: 'api_extensions',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      api_id: 'uuid',
      schema_name: 'text'
    }
  },
  api_schemata: {
    schema: 'meta_public',
    table: 'api_schemata',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      schema_id: 'uuid',
      api_id: 'uuid'
    }
  },
  rls_module: {
    schema: 'meta_public',
    table: 'rls_module',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      api_id: 'uuid',
      schema_id: 'uuid',
      private_schema_id: 'uuid',
      tokens_table_id: 'uuid',
      users_table_id: 'uuid',
      authenticate: 'text',
      authenticate_strict: 'text',
      current_role: 'text',
      current_role_id: 'text'
    }
  },
  user_auth_module: {
    schema: 'meta_public',
    table: 'user_auth_module',
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      schema_id: 'uuid',
      emails_table_id: 'uuid',
      users_table_id: 'uuid',
      secrets_table_id: 'uuid',
      encrypted_table_id: 'uuid',
      tokens_table_id: 'uuid',
      sign_in_function: 'text',
      sign_up_function: 'text',
      sign_out_function: 'text',
      sign_in_one_time_token_function: 'text',
      one_time_token_function: 'text',
      extend_token_expires: 'text',
      send_account_deletion_email_function: 'text',
      delete_account_function: 'text',
      set_password_function: 'text',
      reset_password_function: 'text',
      forgot_password_function: 'text',
      send_verification_email_function: 'text',
      verify_email_function: 'text'
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

  const table = await pool.query(
    `SELECT * FROM collections_public.table WHERE database_id = $1`,
    [database_id]
  );
  sql.table = await parsers.table.parse(table.rows);

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

  // extensions

  // const extensions = await pool.query(
  //   `SELECT * FROM collections_public.extension`
  // );
  // if (extensions.rows.length)
  //   sql.extensions = await parsers.extensions.parse(extensions.rows);

  // database_extension

  const database_extension = await pool.query(
    `SELECT * FROM collections_public.database_extension WHERE database_id = $1`,
    [database_id]
  );

  if (database_extension.rows.length)
    sql.database_extension = await parsers.database_extension.parse(
      database_extension.rows
    );

  // api_extensions

  const api_extensions = await pool.query(
    `SELECT * FROM meta_public.api_extensions WHERE database_id = $1`,
    [database_id]
  );

  if (api_extensions.rows.length)
    sql.api_extensions = await parsers.api_extensions.parse(
      api_extensions.rows
    );

  // api_schemata

  const api_schemata = await pool.query(
    `SELECT * FROM meta_public.api_schemata WHERE database_id = $1`,
    [database_id]
  );

  if (api_schemata.rows.length)
    sql.api_schemata = await parsers.api_schemata.parse(api_schemata.rows);

  // new modules

  const rls_module = await pool.query(
    `SELECT * FROM meta_public.rls_module WHERE database_id = $1`,
    [database_id]
  );

  sql.rls_module = await parsers.rls_module.parse(rls_module.rows);

  const user_auth_module = await pool.query(
    `SELECT * FROM meta_public.user_auth_module WHERE database_id = $1`,
    [database_id]
  );

  sql.user_auth_module = await parsers.user_auth_module.parse(
    user_auth_module.rows
  );

  return Object.entries(sql).reduce((m, [k, v]) => {
    return m + '\n\n' + v;
  }, '');
};
