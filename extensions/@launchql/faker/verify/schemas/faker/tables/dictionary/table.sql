-- Verify schemas/faker/tables/dictionary/table on pg

BEGIN;

SELECT verify_table ('faker.words');

ROLLBACK;
