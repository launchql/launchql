-- Verify schemas/public/domains/single_select on pg

BEGIN;

SELECT verify_domain ('public.single_select');

ROLLBACK;
