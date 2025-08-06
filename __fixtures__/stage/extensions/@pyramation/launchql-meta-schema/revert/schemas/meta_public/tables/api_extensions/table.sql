-- Revert schemas/meta_public/tables/api_extensions/table from pg

BEGIN;

DROP TABLE meta_public.api_extensions;

COMMIT;
