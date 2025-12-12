-- Revert schemas/base32/procedures/decode from pg

BEGIN;

DROP FUNCTION base32.decode;
DROP FUNCTION base32.valid;
DROP FUNCTION base32.zero_fill;
DROP FUNCTION base32.base32_alphabet_to_decimal_int;
DROP FUNCTION base32.decimal_to_chunks;
DROP FUNCTION base32.base32_to_decimal;
DROP FUNCTION base32.base32_alphabet_to_decimal;

COMMIT;
