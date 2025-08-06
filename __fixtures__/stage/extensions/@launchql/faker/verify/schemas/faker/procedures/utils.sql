-- Verify schemas/faker/procedures/utils  on pg

BEGIN;

SELECT verify_function ('faker.utils');

ROLLBACK;
