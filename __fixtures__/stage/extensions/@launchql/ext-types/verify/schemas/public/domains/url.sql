-- Verify schemas/public/domains/url on pg

BEGIN;

SELECT verify_type ('public.url');

ROLLBACK;
