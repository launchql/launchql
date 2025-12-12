-- Revert schemas/stamps/procedures/utils from pg

BEGIN;

DROP FUNCTION stamps.peoplestamps();
DROP FUNCTION stamps.timestamps();

COMMIT;
