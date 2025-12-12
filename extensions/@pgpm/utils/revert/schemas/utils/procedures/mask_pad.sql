-- Revert schemas/utils/procedures/mask_pad from pg

BEGIN;

DROP FUNCTION utils.mask_pad;

COMMIT;
