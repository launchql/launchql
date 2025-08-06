-- Revert roles/anonymous/role from pg

BEGIN;

DROP ROLE anonymous;

COMMIT;
