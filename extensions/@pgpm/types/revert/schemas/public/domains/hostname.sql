-- Revert schemas/public/domains/hostname from pg

BEGIN;

DROP DOMAIN hostname;

COMMIT;
