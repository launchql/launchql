-- Revert schemas/meta_public/tables/secrets_module/table from pg

BEGIN;

DROP TABLE meta_public.secrets_module;

COMMIT;
