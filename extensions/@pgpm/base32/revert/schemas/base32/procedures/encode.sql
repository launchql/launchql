-- Revert schemas/base32/procedures/encode from pg

BEGIN;

DROP FUNCTION base32.encode;
DROP FUNCTION base32.to_base32;
DROP FUNCTION base32.base32_alphabet;
DROP FUNCTION base32.to_decimal;
DROP FUNCTION base32.fill_chunks;
DROP FUNCTION base32.to_chunks;
DROP FUNCTION base32.string_nchars;
DROP FUNCTION base32.to_groups;
DROP FUNCTION base32.to_binary(int[]);
DROP FUNCTION base32.to_binary(int);
DROP FUNCTION base32.to_ascii;
DROP FUNCTION base32.binary_to_int;

COMMIT;
