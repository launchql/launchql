-- Verify schemas/public/domains/upload on pg

BEGIN;

SELECT verify_type ('public.upload');

ROLLBACK;
