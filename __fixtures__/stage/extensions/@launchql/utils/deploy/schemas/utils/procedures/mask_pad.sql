-- Deploy schemas/utils/procedures/mask_pad to pg
-- requires: schemas/utils/schema
BEGIN;

CREATE FUNCTION utils.mask_pad (bitstr text, bitlen int, pad text DEFAULT '0')
  RETURNS text
  AS $$
  SELECT
    (
      CASE WHEN length(bitstr) > bitlen THEN
        substring(bitstr FROM (length(bitstr) - (bitlen - 1))
          FOR bitlen)
      ELSE
        lpad(bitstr, bitlen, pad)
      END)
$$
LANGUAGE 'sql';

CREATE FUNCTION utils.bitmask_pad (bitstr bit varying, bitlen int, pad text DEFAULT '0')
  RETURNS bit varying
  AS $$
  SELECT
    (
      CASE WHEN length(bitstr) > bitlen THEN
        substring(bitstr::text FROM (length(bitstr) - (bitlen - 1))
          FOR bitlen)
      ELSE
        lpad(bitstr::text, bitlen, pad)
      END)::varbit;
$$
LANGUAGE 'sql';
COMMIT;

