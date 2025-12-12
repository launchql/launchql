-- Verify schemas/public/domains/attachment on pg

BEGIN;

SELECT verify_domain ('public.attachment');

ROLLBACK;
