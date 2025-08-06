-- Revert schemas/faker/procedures/utils from pg

BEGIN;

DROP FUNCTION faker.utils;

COMMIT;
