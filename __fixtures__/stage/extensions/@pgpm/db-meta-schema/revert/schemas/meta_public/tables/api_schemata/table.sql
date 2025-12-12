-- Revert schemas/meta_public/tables/api_schemata/table from pg

BEGIN;

DROP TABLE meta_public.api_schemata;

COMMIT;
