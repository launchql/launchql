-- Revert schemas/collections_public/tables/field/indexes/databases_field_uniq_names_idx from pg

BEGIN;

DROP INDEX collections_public.databases_field_uniq_names_idx;

COMMIT;
