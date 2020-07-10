-- Verify procedures/tg_update_timestamps on pg

BEGIN;

SELECT verify_function('public.tg_update_timestamps', 'postgres');

ROLLBACK;
