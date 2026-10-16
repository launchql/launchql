-- Hostnames for the database-scope storage tenant ("Tess", db-scope-storage),
-- across the two kinds of routing plane the server must resolve:
--
--   1. the shared plane (`routing_public`): Tess's storage API host, minted
--      the way provision_database_routing mints a tenant's API hostnames;
--   2. tenant-owned database-scope planes (one `route_module` row each, the
--      planes the static gateway walks): Tess's own plane, and a second
--      tenant ("Mallory") whose plane tries to claim Tess's hostname and to
--      route one of its own hostnames into Tess's database.
--
-- The tenant planes' resolvers keep the resolve_route(host, path, method)
-- contract: one row always, route_binding_id IS NULL on no match.

SET session_replication_role TO replica;

-- ---------------------------------------------------------------------------
-- 1. Shared plane: storage.tess.test.constructive.io -> Tess storage API
-- ---------------------------------------------------------------------------

UPDATE routing_public.apis
   SET is_published = true
 WHERE id = 'ce554000-0000-4000-8000-000000000001';

INSERT INTO catalog_private.apis
  (id, owner_scope, owner_key, is_visible, database_id, name, dbname, role_name, anon_role, config)
VALUES (
  'ce554000-0000-4000-8000-000000000001', 'database', 'ce551000-0000-4000-8000-000000000001', true,
  'ce551000-0000-4000-8000-000000000001', 'tess-app', current_database(), 'authenticated', 'anonymous',
  jsonb_build_object(
    'api_id', 'ce554000-0000-4000-8000-000000000001',
    'database_id', 'ce551000-0000-4000-8000-000000000001',
    'is_public', true,
    'schemas', jsonb_build_array('tess-storage-public')
  )
) ON CONFLICT (id) DO NOTHING;

INSERT INTO catalog_private.domains
  (id, owner_scope, owner_key, is_visible, database_id, hostname, is_wildcard, parent_hostname, managed, verification_status, tls_status)
VALUES (
  'ce55a000-0000-4000-8000-000000000001', 'database', 'ce551000-0000-4000-8000-000000000001', true,
  'ce551000-0000-4000-8000-000000000001', 'storage.tess.test.constructive.io', false, NULL, false, 'verified', 'ready'
) ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;

INSERT INTO routing_public.domains
  (id, database_id, hostname, managed, is_wildcard, parent_hostname, verification_status, tls_status, tls_secret_name, is_published)
VALUES (
  'ce55a000-0000-4000-8000-000000000001', 'ce551000-0000-4000-8000-000000000001',
  'storage.tess.test.constructive.io', false, false, NULL, 'verified', 'ready', NULL, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO routing_public.routes
  (id, database_id, domain_id, target_api_id, path, method, priority, is_active)
VALUES (
  'ce55b000-0000-4000-8000-000000000001', 'ce551000-0000-4000-8000-000000000001',
  'ce55a000-0000-4000-8000-000000000001', 'ce554000-0000-4000-8000-000000000001', '/', NULL, 0, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO routing_public.hostname_bindings
  (id, hostname, domain_id, is_wildcard, parent_hostname, managed, verification_status, tls_status, tls_secret_name, updated_at)
VALUES (
  (md5(concat('ce55a000-0000-4000-8000-000000000001', '|', 'storage.tess.test.constructive.io')))::uuid,
  'storage.tess.test.constructive.io', 'ce55a000-0000-4000-8000-000000000001', false, NULL, false, 'verified', 'ready', NULL, now()
) ON CONFLICT (hostname) DO NOTHING;

INSERT INTO routing_public.route_bindings
  (id, domain_id, target_api_id, target_site_id, target_function_id, path, method, priority, is_active, updated_at)
VALUES (
  'ce55b000-0000-4000-8000-000000000001', 'ce55a000-0000-4000-8000-000000000001',
  'ce554000-0000-4000-8000-000000000001', NULL, NULL, '/', NULL, 0, true, now()
) ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO replica;

-- ---------------------------------------------------------------------------
-- 2. Tenant-owned database-scope planes
-- ---------------------------------------------------------------------------

INSERT INTO metaschema_public.database (id, owner_id, name, hash)
VALUES (
  'ce559000-0000-4000-8000-000000000001', NULL, 'mallory', '6d616c6c-6f72-7900-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, description, is_public)
VALUES
  ('ce552000-0000-4000-8000-000000000003', 'ce551000-0000-4000-8000-000000000001', 'routing_public', 'tess-routing-public', NULL, true),
  ('ce552000-0000-4000-8000-000000000004', 'ce559000-0000-4000-8000-000000000001', 'routing_public', 'mallory-routing-public', NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO metaschema_modules_public.route_module
  (id, database_id, scope, schema_id, private_schema_id, resolver_function_name)
VALUES
  ('ce55c000-0000-4000-8000-000000000001', 'ce551000-0000-4000-8000-000000000001', 'database',
   'ce552000-0000-4000-8000-000000000003', 'ce552000-0000-4000-8000-000000000003', 'resolve_route'),
  ('ce55c000-0000-4000-8000-000000000002', 'ce559000-0000-4000-8000-000000000001', 'database',
   'ce552000-0000-4000-8000-000000000004', 'ce552000-0000-4000-8000-000000000004', 'resolve_route')
ON CONFLICT (id) DO NOTHING;

CREATE SCHEMA "tess-routing-public";
CREATE SCHEMA "mallory-routing-public";

CREATE TABLE "tess-routing-public".bindings (
  hostname text PRIMARY KEY,
  route_binding_id uuid NOT NULL,
  resolved_config jsonb NOT NULL
);
CREATE TABLE "mallory-routing-public".bindings (LIKE "tess-routing-public".bindings INCLUDING ALL);

INSERT INTO "tess-routing-public".bindings (hostname, route_binding_id, resolved_config)
VALUES (
  'storage-ce551000-0000-4000-8000-000000000001.test.constructive.io',
  'ce55d000-0000-4000-8000-000000000001',
  jsonb_build_object(
    'api_id', 'ce554000-0000-4000-8000-000000000001',
    'database_id', 'ce551000-0000-4000-8000-000000000001',
    'is_public', true,
    'role_name', 'authenticated',
    'anon_role', 'anonymous',
    'schemas', jsonb_build_array('tess-storage-public')
  )
);

INSERT INTO "mallory-routing-public".bindings (hostname, route_binding_id, resolved_config)
VALUES
  -- Tess's shared-plane hostname, claimed for Mallory: the shared plane owns it.
  (
    'storage.tess.test.constructive.io',
    'ce55d000-0000-4000-8000-000000000002',
    jsonb_build_object(
      'api_id', 'ce554000-0000-4000-8000-000000000002',
      'database_id', 'ce559000-0000-4000-8000-000000000001',
      'is_public', true,
      'role_name', 'authenticated',
      'anon_role', 'anonymous',
      'schemas', jsonb_build_array('tess-storage-public')
    )
  ),
  -- One of Mallory's hostnames, routed into Tess's database.
  (
    'storage.mallory.test.constructive.io',
    'ce55d000-0000-4000-8000-000000000003',
    jsonb_build_object(
      'api_id', 'ce554000-0000-4000-8000-000000000001',
      'database_id', 'ce551000-0000-4000-8000-000000000001',
      'is_public', true,
      'role_name', 'authenticated',
      'anon_role', 'anonymous',
      'schemas', jsonb_build_array('tess-storage-public')
    )
  );

DO $planes$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['tess-routing-public', 'mallory-routing-public'] LOOP
    EXECUTE format($fn$
      CREATE FUNCTION %1$I.resolve_route(request_host text, request_path text, request_method text)
      RETURNS TABLE (
        route_binding_id uuid, hostname text, matched_wildcard boolean, matched_path text,
        method text, priority int, domain_id uuid, target_catalog_id uuid, target_module text,
        target_source_id uuid, target_owner_scope text, target_owner_key uuid,
        resolved_config jsonb, verification_status text, tls_status text, tls_secret_name text
      )
      LANGUAGE sql STABLE AS $body$
        SELECT b.route_binding_id, b.hostname, false, CASE WHEN b.hostname IS NULL THEN NULL ELSE '/' END,
               NULL::text, 0, NULL::uuid, NULL::uuid, CASE WHEN b.hostname IS NULL THEN NULL ELSE 'apis' END,
               (b.resolved_config->>'api_id')::uuid, NULL::text, NULL::uuid,
               b.resolved_config, NULL::text, NULL::text, NULL::text
        FROM (SELECT 1) one
        LEFT JOIN %1$I.bindings b ON b.hostname = lower(split_part(request_host, ':', 1))
      $body$
    $fn$, s);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated, anonymous', s);
    EXECUTE format('GRANT SELECT ON %I.bindings TO authenticated, anonymous', s);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.resolve_route(text, text, text) TO authenticated, anonymous', s);
  END LOOP;
END
$planes$;

SET session_replication_role TO DEFAULT;
