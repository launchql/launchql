-- Revert my-first:table_products from pg

BEGIN;

DROP TABLE myapp.products;

COMMIT;
