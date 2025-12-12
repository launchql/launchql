-- Revert launchql-verify:procedures/list_memberships from pg

BEGIN;

DROP FUNCTION list_memberships(text);

COMMIT;
