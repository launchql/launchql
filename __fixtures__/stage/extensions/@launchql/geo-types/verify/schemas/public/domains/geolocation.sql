-- Verify schemas/public/domains/geolocation on pg

BEGIN;

SELECT verify_type ('public.location');

ROLLBACK;
