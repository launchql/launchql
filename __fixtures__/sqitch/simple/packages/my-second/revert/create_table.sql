-- Revert my-second:create_table from pg

BEGIN;

DROP TABLE otherschema.mytable CASCADE;

COMMIT;
