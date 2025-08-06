-- Verify roles/authenticated/role  on pg

BEGIN;

SELECT verify_role ('authenticated');

ROLLBACK;
