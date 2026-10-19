-- One database with one schema for the function rows to belong to.
INSERT INTO metaschema_public.database (id, name) VALUES
  ('00000000-0000-4000-8000-00000000000a', 'tenant_a');

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name) VALUES
  ('00000000-0000-4000-8000-0000000000aa', '00000000-0000-4000-8000-00000000000a', 'app_public', 'tenant_a_app_public');
