-- Verify roles/anonymous/role  on pg

BEGIN;

SELECT verify_role ('anonymous');

ROLLBACK;
