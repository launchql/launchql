-- Revert schemas/meta_public/tables/domains/table from pg

BEGIN;

DROP TABLE meta_public.domains;

COMMIT;
