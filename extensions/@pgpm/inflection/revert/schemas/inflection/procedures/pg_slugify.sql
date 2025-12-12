-- Revert schemas/inflection/procedures/pg_slugify from pg

BEGIN;

DROP FUNCTION inflection.pg_slugify(text);
DROP FUNCTION inflection.pg_slugify(text, boolean);

COMMIT;
