-- Verify schemas/public/domains/geopolygon on pg

BEGIN;

SELECT verify_type ('public.geopolygon');

ROLLBACK;
