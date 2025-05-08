-- Verify schemas/public/domains/hostname on pg

BEGIN;

SELECT verify_type ('public.domain');

ROLLBACK;
