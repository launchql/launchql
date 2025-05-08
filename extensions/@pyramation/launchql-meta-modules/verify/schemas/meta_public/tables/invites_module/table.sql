-- Verify schemas/meta_public/tables/invites_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.invites_module');

ROLLBACK;
