-- Verify schemas/meta_public/tables/emails_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.emails_module');

ROLLBACK;
