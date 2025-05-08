-- Verify schemas/public/domains/single_select on pg

BEGIN;

SELECT verify_type ('public.single_select');

ROLLBACK;
