-- Verify schemas/public/domains/upload on pg

BEGIN;

SELECT verify_domain ('public.upload');

ROLLBACK;
