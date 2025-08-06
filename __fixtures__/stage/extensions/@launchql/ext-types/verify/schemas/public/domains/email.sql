-- Verify schemas/public/domains/email on pg

BEGIN;

SELECT verify_type ('public.email');

ROLLBACK;
