-- Revert schemas/inflection/procedures/slugify from pg

BEGIN;

DROP FUNCTION inflection.slugify;

COMMIT;
