
BEGIN;

DROP INDEX collections_public.field_database_id_idx;
DROP INDEX collections_public.field_table_id_idx;
DROP TABLE collections_public.field;

COMMIT;
