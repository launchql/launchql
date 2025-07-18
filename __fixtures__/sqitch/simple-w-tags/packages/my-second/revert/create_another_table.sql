-- Revert my-second:create_another_table from pg

BEGIN;

DROP TABLE otherschema.anothertable;

COMMIT;
