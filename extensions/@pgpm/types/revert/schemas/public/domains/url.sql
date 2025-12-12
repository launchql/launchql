-- Revert schemas/public/domains/url from pg

BEGIN;

DROP TYPE public.url;

COMMIT;
