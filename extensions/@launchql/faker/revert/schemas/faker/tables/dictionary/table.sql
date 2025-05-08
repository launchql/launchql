-- Revert schemas/faker/tables/dictionary/table from pg

BEGIN;

DROP TABLE faker.words;

COMMIT;
