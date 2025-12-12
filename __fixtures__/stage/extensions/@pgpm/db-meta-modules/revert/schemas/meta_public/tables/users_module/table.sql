-- Revert schemas/meta_public/tables/users_module/table from pg

BEGIN;

DROP TABLE meta_public.users_module;

COMMIT;
