-- Verify schemas/faker/procedures/utils  on pg

BEGIN;

SELECT verify_function ('faker.word_type');
SELECT verify_function ('faker.word');
SELECT verify_function ('faker.gender');
SELECT verify_function ('faker.username');
SELECT verify_function ('faker.name');
SELECT verify_function ('faker.surname');
SELECT verify_function ('faker.fullname');
SELECT verify_function ('faker.business');
SELECT verify_function ('faker.city');
SELECT verify_function ('faker.zip');
SELECT verify_function ('faker.lnglat');
SELECT verify_function ('faker.phone');
SELECT verify_function ('faker.street');
SELECT verify_function ('faker.state');
SELECT verify_function ('faker.address');
SELECT verify_function ('faker.tags');
SELECT verify_function ('faker.sentence');
SELECT verify_function ('faker.paragraph');
SELECT verify_function ('faker.email');
SELECT verify_function ('faker.uuid');
SELECT verify_function ('faker.token');
SELECT verify_function ('faker.password');
SELECT verify_function ('faker.hostname');
SELECT verify_function ('faker.time_unit');
SELECT verify_function ('faker.float');
SELECT verify_function ('faker.integer');
SELECT verify_function ('faker.date');
SELECT verify_function ('faker.birthdate');
SELECT verify_function ('faker.interval');
SELECT verify_function ('faker.boolean');
SELECT verify_function ('faker.timestamptz');
SELECT verify_function ('faker.mime');
SELECT verify_function ('faker.ext');
SELECT verify_function ('faker.image_mime');
SELECT verify_function ('faker.image');
SELECT verify_function ('faker.profilepic');
SELECT verify_function ('faker.file');
SELECT verify_function ('faker.url');
SELECT verify_function ('faker.upload');
SELECT verify_function ('faker.ip');
SELECT verify_function ('faker.attachment');

ROLLBACK;
