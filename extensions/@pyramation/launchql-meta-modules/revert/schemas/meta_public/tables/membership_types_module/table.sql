-- Revert schemas/meta_public/tables/membership_types_module/table from pg

BEGIN;

DROP TABLE meta_public.membership_types_module;

COMMIT;
