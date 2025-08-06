-- Revert schemas/meta_public/tables/invites_module/table from pg

BEGIN;

DROP TABLE meta_public.invites_module;

COMMIT;
