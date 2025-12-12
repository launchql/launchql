-- Verify schemas/public/domains/hostname on pg

BEGIN;

SELECT verify_domain ('public.hostname');

ROLLBACK;
