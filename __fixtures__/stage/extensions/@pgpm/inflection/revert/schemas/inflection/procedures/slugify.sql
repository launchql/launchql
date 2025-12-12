-- Revert schemas/inflection/procedures/slugify from pg

BEGIN;

DROP FUNCTION inflection.slugify(text);
DROP FUNCTION inflection.slugify(text, boolean);

COMMIT;
