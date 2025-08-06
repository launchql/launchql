-- Deploy schemas/collections_public/tables/field/table to pg


-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/table/table

BEGIN;

-- TODO should we just query this table and make a view?
-- https://www.postgresql.org/docs/9.2/catalog-pg-attribute.html

-- IF YOU WANT TO REMOVE THIS TABLE, answer the qustion, how would you add RLS to this:
--  SELECT 
--       attrelid::text AS tbl
--       , attname::text            AS col
--       , p.attnum::int as id,
--       t.typname as typename

--   FROM   pg_catalog.pg_attribute p
--   INNER JOIN  pg_catalog.pg_type t ON (t.oid = p.atttypid)
--   WHERE  attrelid = 'dude_schema.products'::regclass
--   AND    p.attnum > 0
--   AND    NOT attisdropped;


CREATE TABLE collections_public.field (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),
  
  table_id uuid NOT NULL,
  
  name text NOT NULL,
  label text,
  
  description text,
  smart_tags jsonb,

  is_required boolean NOT NULL DEFAULT FALSE,
  default_value text NULL DEFAULT NULL,

  -- hidden from API using @omit keyword, a Graphile feature ONLY
  is_hidden boolean NOT NULL DEFAULT FALSE,
  

  type citext NOT NULL,

  -- typmods DO THIS SOON!

  field_order int not null default 0,

  regexp text default null,
  chk jsonb default null,
  chk_expr jsonb default null,
  min float default null,
  max float default null,

  --
  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

  UNIQUE (table_id, name)
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.field IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.field IS E'@omit manyToMany';

CREATE INDEX field_table_id_idx ON collections_public.field ( table_id );
CREATE INDEX field_database_id_idx ON collections_public.field ( database_id );

COMMIT;