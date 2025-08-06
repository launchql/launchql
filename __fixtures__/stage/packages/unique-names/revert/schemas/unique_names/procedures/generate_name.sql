-- Revert schemas/unique_names/procedures/generate_name from pg

BEGIN;

DROP FUNCTION unique_names.generate_name;

COMMIT;
