-- Deploy schemas/utils/procedures/throw to pg

-- requires: schemas/utils/schema

BEGIN;

CREATE FUNCTION utils.throw()
  RETURNS TRIGGER
AS $$
BEGIN

  IF (TG_NARGS = 1) THEN 
    RAISE EXCEPTION '% (%)', TG_ARGV[0], TG_TABLE_NAME;
  END IF;

  IF (TG_NARGS > 1) THEN 
    RAISE EXCEPTION '% (%, %)', TG_ARGV[0], TG_TABLE_NAME, TG_ARGV[1];
  END IF;

  RAISE EXCEPTION 'THROWN_ERROR (%)', TG_TABLE_NAME;

END;
$$
LANGUAGE 'plpgsql';

COMMIT;
