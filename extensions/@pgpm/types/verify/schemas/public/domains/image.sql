-- Verify schemas/public/domains/image on pg

BEGIN;

SELECT verify_domain ('public.image');

ROLLBACK;
