-- Revert schemas/public/domains/geopolygon from pg

BEGIN;

DROP TYPE public.geopolygon;

COMMIT;
