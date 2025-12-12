-- Verify schemas/public/domains/url on pg

BEGIN;

SELECT verify_domain ('public.url');

ROLLBACK;
