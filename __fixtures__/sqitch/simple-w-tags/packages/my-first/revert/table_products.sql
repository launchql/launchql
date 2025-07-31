-- Revert my-first:table_products from pg

BEGIN;

DROP TABLE myfirstapp.products;

COMMIT;
