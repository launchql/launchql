-- Verify schemas/jwt_private/procedures/current_database_id  on pg

BEGIN;

SELECT verify_function ('jwt_private.current_database_id');

ROLLBACK;
