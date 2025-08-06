-- Verify schemas/public/domains/image on pg

BEGIN;

SELECT verify_type ('public.image');

ROLLBACK;
