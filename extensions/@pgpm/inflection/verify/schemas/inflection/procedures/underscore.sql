-- Verify schemas/inflection/procedures/underscore  on pg

BEGIN;

SELECT verify_function ('inflection.underscore(text)');
SELECT verify_function ('inflection.underscore(text[])');

ROLLBACK;
