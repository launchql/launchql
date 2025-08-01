
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS collections_public;
GRANT USAGE ON SCHEMA collections_public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_public GRANT ALL ON FUNCTIONS TO authenticated;

CREATE SCHEMA IF NOT EXISTS meta_public;
GRANT USAGE ON SCHEMA meta_public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON FUNCTIONS TO authenticated;

CREATE TABLE IF NOT EXISTS collections_public.database (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    owner_id uuid,
    schema_hash text,
    schema_name text,
    private_schema_name text,
    name text,
    label text,
    hash uuid,
    description text,
    UNIQUE ( schema_hash ),
    UNIQUE ( schema_name ),
    UNIQUE ( private_schema_name )
);

CREATE TABLE IF NOT EXISTS meta_public.apis (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    name text NOT NULL,
    dbname text NOT NULL DEFAULT ( current_database() ),
    role_name text NOT NULL DEFAULT ( 'authenticated' ),
    anon_role text NOT NULL DEFAULT ( 'anonymous' ),
    is_public boolean NOT NULL DEFAULT ( TRUE ),
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    UNIQUE ( database_id, name )
);

CREATE TABLE IF NOT EXISTS meta_public.api_extensions (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    schema_name text,
    database_id uuid NOT NULL,
    api_id uuid NOT NULL,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY ( api_id ) REFERENCES meta_public.apis ( id ) ON DELETE CASCADE,
    UNIQUE ( schema_name, api_id )
);

CREATE TABLE IF NOT EXISTS meta_public.api_modules (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    api_id uuid NOT NULL,
    name text NOT NULL,
    data json NOT NULL,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    CONSTRAINT api_modules_api_id_fkey FOREIGN KEY ( api_id ) REFERENCES meta_public.apis ( id )
);

CREATE TABLE IF NOT EXISTS meta_public.domains (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    api_id uuid,
    site_id uuid,
    subdomain text,
    domain text,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY ( api_id ) REFERENCES meta_public.apis ( id ) ON DELETE CASCADE,
    UNIQUE ( subdomain, domain )
);

CREATE TABLE IF NOT EXISTS collections_public.schema (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    schema_name text NOT NULL,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    UNIQUE ( database_id, schema_name )
);

CREATE TABLE IF NOT EXISTS meta_public.api_schemata (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    schema_id uuid NOT NULL,
    api_id uuid NOT NULL,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY ( schema_id ) REFERENCES collections_public.schema ( id ) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY ( api_id ) REFERENCES meta_public.apis ( id ) ON DELETE CASCADE,
    UNIQUE ( api_id, schema_id )
);

CREATE TABLE IF NOT EXISTS meta_public.sites (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    title text,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections_public.rls_function (
    id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
    database_id uuid NOT NULL,
    table_id uuid,
    schema_name text,
    function_name text,
    authenticate boolean DEFAULT false,
    authenticate_strict boolean DEFAULT false,
    current_role text,
    current_role_id text,
    CONSTRAINT db_fkey FOREIGN KEY ( database_id ) REFERENCES collections_public.database ( id ) ON DELETE CASCADE
);

INSERT INTO collections_public.database (id, name, description)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test-database', 'Test database for meta schema testing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO meta_public.apis (
  id, 
  database_id, 
  name, 
  dbname, 
  role_name, 
  anon_role, 
  is_public
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'test-api',
  'test_db',
  'authenticated',
  'anonymous',
  true
) ON CONFLICT (database_id, name) DO NOTHING;

INSERT INTO meta_public.domains (
  id,
  database_id,
  api_id,
  subdomain,
  domain
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'test',
  'localhost'
) ON CONFLICT (subdomain, domain) DO NOTHING;

INSERT INTO meta_public.api_extensions (
  id,
  schema_name,
  database_id,
  api_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'public',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (schema_name, api_id) DO NOTHING;

INSERT INTO meta_public.api_modules (
  id,
  database_id,
  api_id,
  name,
  data
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'rls',
  '{"privateSchema": {"schemaName": "private"}, "authenticate": "authenticate_user", "authenticateStrict": "authenticate_user_strict", "currentRole": "authenticated", "currentRoleId": "user_id"}'::json
) ON CONFLICT DO NOTHING;

INSERT INTO collections_public.schema (
  id,
  database_id,
  schema_name
) VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  'public'
) ON CONFLICT (database_id, schema_name) DO NOTHING;

INSERT INTO meta_public.api_schemata (
  id,
  database_id,
  schema_id,
  api_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (api_id, schema_id) DO NOTHING;

INSERT INTO meta_public.sites (
  id,
  database_id,
  title
) VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Site'
) ON CONFLICT DO NOTHING;

UPDATE meta_public.domains 
SET site_id = '550e8400-e29b-41d4-a716-446655440007'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

INSERT INTO collections_public.rls_function (
  id,
  database_id,
  schema_name,
  function_name,
  authenticate,
  authenticate_strict,
  current_role,
  current_role_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  'private',
  'authenticate_user',
  true,
  false,
  'authenticated',
  'user_id'
) ON CONFLICT DO NOTHING;
