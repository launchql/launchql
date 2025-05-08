-- Verify roles/administrator/role  on pg

BEGIN;

SELECT verify_role ('administrator');

ROLLBACK;
