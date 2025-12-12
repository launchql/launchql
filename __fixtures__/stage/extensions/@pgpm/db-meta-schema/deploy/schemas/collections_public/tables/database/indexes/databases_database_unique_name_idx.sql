-- Deploy schemas/collections_public/tables/database/indexes/databases_database_unique_name_idx to pg
-- requires: schemas/collections_private/schema
-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table

BEGIN;

CREATE FUNCTION collections_private.database_name_hash (name text)
  RETURNS bytea
  AS $BODY$
  SELECT
    DECODE(MD5(LOWER(inflection.plural (name))), 'hex');
$BODY$
LANGUAGE sql
IMMUTABLE;

CREATE UNIQUE INDEX databases_database_unique_name_idx ON collections_public.database (owner_id, collections_private.database_name_hash (name));

COMMIT;

