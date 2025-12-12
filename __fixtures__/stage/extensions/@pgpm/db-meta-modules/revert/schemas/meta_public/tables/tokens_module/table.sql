-- Revert schemas/meta_public/tables/tokens_module/table from pg

BEGIN;

DROP TABLE meta_public.tokens_module;

COMMIT;
