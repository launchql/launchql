-- Revert schemas/collections_public/tables/policy/table from pg

BEGIN;

DROP TABLE collections_public.policy;

COMMIT;
