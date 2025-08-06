-- Verify schemas/public/domains/origin on pg

BEGIN;

SELECT verify_type ('public.origin');

ROLLBACK;
