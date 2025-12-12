-- Revert schemas/inflection/procedures/should_skip_uncountable from pg

BEGIN;

DROP FUNCTION inflection.should_skip_uncountable;

COMMIT;
