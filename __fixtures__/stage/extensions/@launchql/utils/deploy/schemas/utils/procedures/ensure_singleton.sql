-- Deploy schemas/utils/procedures/ensure_singleton to pg

-- requires: schemas/utils/schema

BEGIN;

CREATE FUNCTION utils.ensure_singleton()
  RETURNS TRIGGER
AS $$
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
$$
LANGUAGE 'plpgsql';

COMMIT;
