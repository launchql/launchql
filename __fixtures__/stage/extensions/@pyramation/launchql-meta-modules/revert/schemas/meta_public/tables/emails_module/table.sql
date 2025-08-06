-- Revert schemas/meta_public/tables/emails_module/table from pg

BEGIN;

DROP TABLE meta_public.emails_module;

COMMIT;
