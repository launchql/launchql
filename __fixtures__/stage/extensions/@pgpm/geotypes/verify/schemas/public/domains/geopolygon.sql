-- Verify schemas/public/domains/geopolygon on pg

BEGIN;

SELECT verify_domain ('public.geopolygon');

ROLLBACK;