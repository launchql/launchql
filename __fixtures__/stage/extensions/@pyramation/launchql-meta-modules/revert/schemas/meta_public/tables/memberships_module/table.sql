-- Revert schemas/meta_public/tables/memberships_module/table from pg

BEGIN;

DROP TABLE meta_public.memberships_module;

COMMIT;
