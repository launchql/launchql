-- Revert roles/authenticated/role from pg

BEGIN;

DROP ROLE authenticated;

COMMIT;
