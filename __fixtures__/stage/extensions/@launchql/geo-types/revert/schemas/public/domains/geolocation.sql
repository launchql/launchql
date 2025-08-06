-- Revert schemas/public/domains/geolocation from pg

BEGIN;

DROP TYPE public.location;

COMMIT;
