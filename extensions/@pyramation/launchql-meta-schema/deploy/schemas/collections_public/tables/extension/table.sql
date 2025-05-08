-- Deploy schemas/collections_public/tables/extension/table to pg

-- requires: schemas/collections_public/schema

BEGIN;

-- TODO add package name

CREATE TABLE collections_public.extension (
  name text NOT NULL PRIMARY KEY,
  public_schemas text[],
  private_schemas text[]
);

INSERT INTO collections_public.extension (name, public_schemas, private_schemas) VALUES 
  (
    'collections',
    ARRAY['collections_public'],
    ARRAY['collections_private']
  ),
  (
    'meta',
    ARRAY['meta_public'],
    ARRAY['meta_private']
  )
;

COMMIT;
