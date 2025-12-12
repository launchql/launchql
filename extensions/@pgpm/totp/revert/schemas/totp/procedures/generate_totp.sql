-- Revert schemas/totp/procedures/generate_totp from pg

BEGIN;

DROP FUNCTION totp.url;
DROP FUNCTION totp.verify;
DROP FUNCTION totp.timing_safe_equals(a text, b text);
DROP FUNCTION totp.timing_safe_equals(a bytea, b bytea);
DROP FUNCTION totp.generate;
DROP FUNCTION totp.hotp;
DROP FUNCTION totp.base32_to_hex;
DROP FUNCTION totp.pad_secret;

COMMIT;
