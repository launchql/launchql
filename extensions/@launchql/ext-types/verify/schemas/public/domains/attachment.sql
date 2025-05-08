-- Verify schemas/public/domains/attachment on pg

BEGIN;

SELECT verify_type ('public.attachment');

ROLLBACK;
