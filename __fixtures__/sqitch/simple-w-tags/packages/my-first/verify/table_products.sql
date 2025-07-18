-- Verify my-first:table_products on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'myapp' AND table_name = 'products';

ROLLBACK;
