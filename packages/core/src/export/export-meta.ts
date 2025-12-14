import { PgpmOptions } from '@pgpmjs/types';
import { Parser } from 'csv-to-pg';
import { getPgPool } from 'pg-cache';

type FieldType = 'uuid' | 'text' | 'text[]' | 'boolean' | 'image' | 'upload' | 'url' | 'jsonb';

interface TableConfig {
  schema: string;
  table: string;
  fields: Record<string, FieldType>;
}

const config: Record<string, TableConfig> = {
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

interface ExportMetaParams {
  opts: PgpmOptions,
  dbname: string;
  database_id: string;
}

export const exportMeta = async ({ opts, dbname, database_id }: ExportMetaParams): Promise<string> => {
  const pool = getPgPool({
    ...opts.pg,
    database: dbname
  });
  const sql: Record<string, string> = {};
  const parsers: Record<string, Parser> = Object.entries(config).reduce((m, [name, config]) => {
    m[name] = new Parser(config);
    return m;
  }, {} as Record<string, Parser>);

  const queryAndParse = async (key: string, query: string) => {
    const result = await pool.query(query, [database_id]);
    if (result.rows.length) {
      sql[key] = await parsers[key].parse(result.rows);
    }
  };

  await queryAndParse('database', `SELECT * FROM collections_public.database WHERE id = $1`);
  await queryAndParse('schema', `SELECT * FROM collections_public.schema WHERE database_id = $1`);
  await queryAndParse('table', `SELECT * FROM collections_public.table WHERE database_id = $1`);
  await queryAndParse('domains', `SELECT * FROM meta_public.domains WHERE database_id = $1`);
  await queryAndParse('apis', `SELECT * FROM meta_public.apis WHERE database_id = $1`);
  await queryAndParse('sites', `SELECT * FROM meta_public.sites WHERE database_id = $1`);
  await queryAndParse('api_modules', `SELECT * FROM meta_public.api_modules WHERE database_id = $1`);
  await queryAndParse('site_modules', `SELECT * FROM meta_public.site_modules WHERE database_id = $1`);
  await queryAndParse('site_themes', `SELECT * FROM meta_public.site_themes WHERE database_id = $1`);
  await queryAndParse('apps', `SELECT * FROM meta_public.apps WHERE database_id = $1`);
  await queryAndParse('database_extension', `SELECT * FROM collections_public.database_extension WHERE database_id = $1`);
  await queryAndParse('api_extensions', `SELECT * FROM meta_public.api_extensions WHERE database_id = $1`);
  await queryAndParse('api_schemata', `SELECT * FROM meta_public.api_schemata WHERE database_id = $1`);
  await queryAndParse('rls_module', `SELECT * FROM meta_public.rls_module WHERE database_id = $1`);
  await queryAndParse('user_auth_module', `SELECT * FROM meta_public.user_auth_module WHERE database_id = $1`);

  return Object.entries(sql).reduce((m, [_, v]) => m + '\n\n' + v, '');
};
