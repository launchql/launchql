-- Verify schemas/public/domains/email on pg

BEGIN;

SELECT verify_domain ('public.email');

ROLLBACK;
