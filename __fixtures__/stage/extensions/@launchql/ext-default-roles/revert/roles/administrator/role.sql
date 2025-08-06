-- Revert roles/administrator/role from pg

BEGIN;

DROP ROLE administrator;

COMMIT;
