\echo Use "CREATE EXTENSION launchql-utils" to load this file. \quit
CREATE SCHEMA utils;

GRANT USAGE ON SCHEMA utils TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA utils 
 GRANT EXECUTE ON FUNCTIONS  TO PUBLIC;

CREATE FUNCTION utils.mask_pad ( bitstr text, bitlen int, pad text DEFAULT '0' ) RETURNS text AS $EOFCODE$
  SELECT
    (
      CASE WHEN length(bitstr) > bitlen THEN
        substring(bitstr FROM (length(bitstr) - (bitlen - 1))
          FOR bitlen)
      ELSE
        lpad(bitstr, bitlen, pad)
      END)
$EOFCODE$ LANGUAGE sql;

CREATE FUNCTION utils.bitmask_pad ( bitstr pg_catalog.varbit, bitlen int, pad text DEFAULT '0' ) RETURNS pg_catalog.varbit AS $EOFCODE$
  SELECT
    (
      CASE WHEN length(bitstr) > bitlen THEN
        substring(bitstr::text FROM (length(bitstr) - (bitlen - 1))
          FOR bitlen)
      ELSE
        lpad(bitstr::text, bitlen, pad)
      END)::varbit;
$EOFCODE$ LANGUAGE sql;

CREATE FUNCTION utils.throw (  ) RETURNS trigger AS $EOFCODE$
BEGIN

  IF (TG_NARGS = 1) THEN 
    RAISE EXCEPTION '% (%)', TG_ARGV[0], TG_TABLE_NAME;
  END IF;

  IF (TG_NARGS > 1) THEN 
    RAISE EXCEPTION '% (%, %)', TG_ARGV[0], TG_TABLE_NAME, TG_ARGV[1];
  END IF;

  RAISE EXCEPTION 'THROWN_ERROR (%)', TG_TABLE_NAME;

END;
$EOFCODE$ LANGUAGE plpgsql;

CREATE FUNCTION utils.ensure_singleton (  ) RETURNS trigger AS $EOFCODE$
DECLARE
  sql text;
  num int;
BEGIN

  sql = format('SELECT count(1) FROM %1I.%2I;', TG_TABLE_SCHEMA, TG_TABLE_NAME);
  
  EXECUTE sql
    INTO num;

  IF (num > 0) THEN 
    RAISE EXCEPTION 'SINGLETON_TABLE';
  END IF;

  RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql;