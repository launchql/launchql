-- Revert schemas/meta_public/tables/user_auth_module/table from pg

BEGIN;

DROP TABLE meta_public.user_auth_module;

COMMIT;
