-- Revert schemas/inflection/procedures/slugify_trigger from pg

BEGIN;

DROP FUNCTION inflection.slugify_trigger;

COMMIT;
