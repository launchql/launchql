-- Verify schemas/public/domains/multiple_select on pg

BEGIN;

SELECT verify_domain ('public.multiple_select');

ROLLBACK;
