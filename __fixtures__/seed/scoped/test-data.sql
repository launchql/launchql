-- Shared fixture: metaschema + scoped catalog/routing/apps test data
--
-- Scoped routing plane test data: models the "simple-pets" tenant as rows in
-- the published modules
--   - @constructive-db/catalog -> catalog_private
--   - @constructive-db/routing -> routing_public (incl. resolve_route())
--   - @constructive-db/apps    -> apps_public
--
-- The metaschema block below seeds metaschema_public directly so this file can
-- be composed standalone (routing.api_schemas.schema_id FKs
-- metaschema_public.schema).
--
-- `routing_public.{hostname_bindings,route_bindings}` are the
-- compiled indexes read by resolve_route(). The published schema+grants
-- modules ship no binding-sync triggers, so this fixture seeds the compiled
-- binding rows directly alongside the source rows (domains/routes).
--
-- NOTE: does NOT include app-level schemas/tables or row data.
--       Compose with app-schemas/* seeds for that.

SET session_replication_role TO replica;

-- =====================================================
-- METASCHEMA DATA
-- =====================================================

-- Database entry (ID matches servicesDatabaseId in test files)
INSERT INTO metaschema_public.database (id, owner_id, name, hash)
VALUES (
  '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
  NULL,
  'simple-pets',
  '425a0f10-0170-5760-85df-2a980c378224'
) ON CONFLICT (id) DO NOTHING;

-- Schema entries
INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, description, is_public)
VALUES
  ('6dbae92a-5450-401b-1ed5-d69e7754940d', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'public', 'simple-pets-public', NULL, true),
  ('6dba9876-043f-48ee-399d-ddc991ad978d', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'private', 'simple-pets-private', NULL, false),
  ('6dba6f21-0193-43f4-3bdb-61b4b956b6b6', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'pets_public', 'simple-pets-pets-public', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Table entry for animals
INSERT INTO metaschema_public.table (id, database_id, schema_id, name, description)
VALUES (
  '6dba36e9-b098-4157-1b4c-e5b6e3a885de',
  '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
  '6dba6f21-0193-43f4-3bdb-61b4b956b6b6',
  'animals',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Field entries for animals table
INSERT INTO metaschema_public.field (id, database_id, table_id, name, type, description)
VALUES
  ('6dbace4d-bcf9-4d55-e363-6b24623f0d8a', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba36e9-b098-4157-1b4c-e5b6e3a885de', 'id', '{"name": "uuid"}', NULL),
  ('6dbae9c7-3460-4f65-8290-b2a8e05eb714', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba36e9-b098-4157-1b4c-e5b6e3a885de', 'name', '{"name": "text"}', NULL),
  ('6dbacc68-876e-4ece-b190-706819ae4f00', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba36e9-b098-4157-1b4c-e5b6e3a885de', 'species', '{"name": "text"}', NULL),
  ('6dba080e-bb3f-4556-8ca7-425ceb98a519', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba36e9-b098-4157-1b4c-e5b6e3a885de', 'owner_id', '{"name": "uuid"}', NULL)
ON CONFLICT (id) DO NOTHING;

-- Primary key constraint
INSERT INTO metaschema_public.primary_key_constraint (id, database_id, table_id, name, type, field_ids)
VALUES (
  '6dbaeb74-b5cf-46d5-4724-6ab26c27da2d',
  '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
  '6dba36e9-b098-4157-1b4c-e5b6e3a885de',
  'animals_pkey',
  'p',
  '{6dbace4d-bcf9-4d55-e363-6b24623f0d8a}'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CATALOG DATA (catalog_private)
-- =====================================================
--
-- `apis.config` carries the api surface projection the server folds into
-- ApiStructure via resolve_route().resolved_config (api_id, database_id,
-- is_public, schemas); name/dbname/role_name/anon_role are merged in by the
-- resolver from the columns below.

INSERT INTO catalog_private.apis
  (id, owner_scope, owner_key, is_visible, database_id, name, dbname, role_name, anon_role, config)
VALUES
  (
    '6c9997a4-591b-4cb3-9313-4ef45d6f134e', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', true,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'app', current_database(), 'authenticated', 'anonymous',
    jsonb_build_object(
      'api_id', '6c9997a4-591b-4cb3-9313-4ef45d6f134e',
      'database_id', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
      'is_public', true,
      'schemas', jsonb_build_array('simple-pets-public', 'simple-pets-pets-public')
    )
  ),
  (
    'e257c53d-6ba6-40de-b679-61b37188a316', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', false,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'private', current_database(), 'authenticated', 'anonymous',
    jsonb_build_object(
      'api_id', 'e257c53d-6ba6-40de-b679-61b37188a316',
      'database_id', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
      'is_public', false,
      'schemas', jsonb_build_array('simple-pets-public', 'simple-pets-private', 'simple-pets-pets-public')
    )
  ),
  (
    '28199444-da40-40b1-8a4c-53edbf91c738', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', true,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'public', current_database(), 'authenticated', 'anonymous',
    jsonb_build_object(
      'api_id', '28199444-da40-40b1-8a4c-53edbf91c738',
      'database_id', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
      'is_public', true,
      'schemas', jsonb_build_array('simple-pets-public')
    )
  ),
  (
    'cc1e8389-e69d-4e12-9089-a98bf11fc75f', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', true,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'admin', current_database(), 'authenticated', 'anonymous',
    jsonb_build_object(
      'api_id', 'cc1e8389-e69d-4e12-9089-a98bf11fc75f',
      'database_id', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
      'is_public', true,
      'schemas', jsonb_build_array('simple-pets-public')
    )
  ),
  (
    'a2e6098f-2c11-4f2a-b481-c19175bc62ef', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', true,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'auth', current_database(), 'authenticated', 'anonymous',
    jsonb_build_object(
      'api_id', 'a2e6098f-2c11-4f2a-b481-c19175bc62ef',
      'database_id', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
      'is_public', true,
      'schemas', jsonb_build_array('simple-pets-public')
    )
  )
ON CONFLICT (id) DO NOTHING;

-- Catalog domains: globally-claimed hostnames (same ids as services domains)
INSERT INTO catalog_private.domains
  (id, owner_scope, owner_key, is_visible, database_id, hostname, is_wildcard, parent_hostname, managed, verification_status, tls_status)
VALUES
  (
    '41181146-890e-4991-9da7-3dddf87d9e78', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', true,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'app.test.constructive.io', false, NULL, false, 'verified', 'ready'
  ),
  (
    '51181146-890e-4991-9da7-3dddf87d9e79', 'database', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', false,
    '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'private.test.constructive.io', false, NULL, false, 'verified', 'ready'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROUTING DATA (routing_public)
-- =====================================================

-- Routing-side api surfaces (own the api_schemas / settings joins)
INSERT INTO routing_public.apis
  (id, database_id, name, dbname, role_name, anon_role, is_published)
VALUES
  ('6c9997a4-591b-4cb3-9313-4ef45d6f134e', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'app', current_database(), 'authenticated', 'anonymous', true),
  ('e257c53d-6ba6-40de-b679-61b37188a316', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'private', current_database(), 'authenticated', 'anonymous', false),
  ('28199444-da40-40b1-8a4c-53edbf91c738', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'public', current_database(), 'authenticated', 'anonymous', true),
  ('cc1e8389-e69d-4e12-9089-a98bf11fc75f', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'admin', current_database(), 'authenticated', 'anonymous', true),
  ('a2e6098f-2c11-4f2a-b481-c19175bc62ef', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'auth', current_database(), 'authenticated', 'anonymous', true)
ON CONFLICT (id) DO NOTHING;

-- API -> schema linkage
INSERT INTO routing_public.api_schemas (id, database_id, schema_id, api_id)
VALUES
  -- app API schemas (public + pets_public)
  ('71181146-890e-4991-9da7-3dddf87d9e01', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dbae92a-5450-401b-1ed5-d69e7754940d', '6c9997a4-591b-4cb3-9313-4ef45d6f134e'),
  ('71181146-890e-4991-9da7-3dddf87d9e02', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba6f21-0193-43f4-3bdb-61b4b956b6b6', '6c9997a4-591b-4cb3-9313-4ef45d6f134e'),
  -- private API schemas (public + private + pets_public)
  ('71181146-890e-4991-9da7-3dddf87d9e03', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dbae92a-5450-401b-1ed5-d69e7754940d', 'e257c53d-6ba6-40de-b679-61b37188a316'),
  ('71181146-890e-4991-9da7-3dddf87d9e04', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba9876-043f-48ee-399d-ddc991ad978d', 'e257c53d-6ba6-40de-b679-61b37188a316'),
  ('71181146-890e-4991-9da7-3dddf87d9e05', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba6f21-0193-43f4-3bdb-61b4b956b6b6', 'e257c53d-6ba6-40de-b679-61b37188a316')
ON CONFLICT (id) DO NOTHING;

-- Routing-side domains (source rows for the compiled hostname index).
-- Triggers are re-enabled here: the published modules attach only the
-- catalog-sync propagation triggers, whose upserts into catalog_private are
-- idempotent with the direct catalog seeds above. Binding-sync triggers are
-- NOT published, so the compiled hostname_bindings/route_bindings rows are
-- still seeded directly below.
SET session_replication_role TO DEFAULT;

INSERT INTO routing_public.domains
  (id, database_id, hostname, managed, is_wildcard, parent_hostname, verification_status, tls_status, tls_secret_name, is_published)
VALUES
  ('41181146-890e-4991-9da7-3dddf87d9e78', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'app.test.constructive.io', false, false, NULL, 'verified', 'ready', NULL, true),
  ('51181146-890e-4991-9da7-3dddf87d9e79', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'private.test.constructive.io', false, false, NULL, 'verified', 'ready', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Routes: hostname root path -> api surface (source rows)
INSERT INTO routing_public.routes
  (id, database_id, domain_id, target_api_id, path, method, priority, is_active)
VALUES
  ('91181146-890e-4991-9da7-3dddf87d9e01', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '41181146-890e-4991-9da7-3dddf87d9e78', '6c9997a4-591b-4cb3-9313-4ef45d6f134e', '/', NULL, 0, true),
  ('91181146-890e-4991-9da7-3dddf87d9e02', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '51181146-890e-4991-9da7-3dddf87d9e79', 'e257c53d-6ba6-40de-b679-61b37188a316', '/', NULL, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Compiled binding indexes read by resolve_route(). The published routing
-- module ships no binding-sync triggers, so seed the compiled rows directly
-- (hostname_bindings.id mirrors the trigger derivation md5(domain_id|hostname)).
INSERT INTO routing_public.hostname_bindings
  (id, hostname, domain_id, is_wildcard, parent_hostname, managed, verification_status, tls_status, tls_secret_name, updated_at)
VALUES
  ((md5(concat('41181146-890e-4991-9da7-3dddf87d9e78', '|', 'app.test.constructive.io')))::uuid, 'app.test.constructive.io', '41181146-890e-4991-9da7-3dddf87d9e78', false, NULL, false, 'verified', 'ready', NULL, now()),
  ((md5(concat('51181146-890e-4991-9da7-3dddf87d9e79', '|', 'private.test.constructive.io')))::uuid, 'private.test.constructive.io', '51181146-890e-4991-9da7-3dddf87d9e79', false, NULL, false, 'verified', 'ready', NULL, now())
ON CONFLICT (hostname) DO NOTHING;

INSERT INTO routing_public.route_bindings
  (id, domain_id, target_api_id, target_site_id, target_function_id, path, method, priority, is_active, updated_at)
VALUES
  ('91181146-890e-4991-9da7-3dddf87d9e01', '41181146-890e-4991-9da7-3dddf87d9e78', '6c9997a4-591b-4cb3-9313-4ef45d6f134e', NULL, NULL, '/', NULL, 0, true, now()),
  ('91181146-890e-4991-9da7-3dddf87d9e02', '51181146-890e-4991-9da7-3dddf87d9e79', 'e257c53d-6ba6-40de-b679-61b37188a316', NULL, NULL, '/', NULL, 0, true, now())
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO replica;

-- =====================================================
-- APPS DATA (apps_public)
-- =====================================================

INSERT INTO apps_public.apps
  (id, database_id, name, title, description, status, is_published)
VALUES (
  'c1181146-890e-4991-9da7-3dddf87d9e01',
  '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
  'simple-pets',
  'Simple Pets',
  'Scoped-plane fixture app for the simple-pets tenant',
  'active',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO apps_public.app_components
  (id, database_id, app_id, component_api_id, component_domain_id, component_type)
VALUES
  ('d1181146-890e-4991-9da7-3dddf87d9e01', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'c1181146-890e-4991-9da7-3dddf87d9e01', '6c9997a4-591b-4cb3-9313-4ef45d6f134e', NULL, 'api'),
  ('d1181146-890e-4991-9da7-3dddf87d9e02', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'c1181146-890e-4991-9da7-3dddf87d9e01', 'e257c53d-6ba6-40de-b679-61b37188a316', NULL, 'api'),
  ('d1181146-890e-4991-9da7-3dddf87d9e03', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'c1181146-890e-4991-9da7-3dddf87d9e01', NULL, '41181146-890e-4991-9da7-3dddf87d9e78', 'domain'),
  ('d1181146-890e-4991-9da7-3dddf87d9e04', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'c1181146-890e-4991-9da7-3dddf87d9e01', NULL, '51181146-890e-4991-9da7-3dddf87d9e79', 'domain')
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;
