-- Deploy schemas/collections_public/tables/field/indexes/databases_field_uniq_names_idx to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/field/table

BEGIN;

CREATE UNIQUE INDEX databases_field_uniq_names_idx ON collections_public.field (
   -- strip out any _id, etc., so that if you do create one and make foreign key relation, there is no conflict
  table_id, DECODE(MD5(LOWER(regexp_replace(name, '^(.+?)(_row_id|_id|_uuid|_fk|_pk)$', '\1', 'i'))), 'hex')
);

COMMIT;
