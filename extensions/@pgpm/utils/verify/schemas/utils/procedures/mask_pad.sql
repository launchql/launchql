-- Verify schemas/utils/procedures/mask_pad  on pg

BEGIN;

SELECT verify_function ('utils.mask_pad');

ROLLBACK;
