-- Deploy procedures/verify_schema to pg


BEGIN;

CREATE FUNCTION verify_schema (_schema text)
    RETURNS boolean
AS $$
BEGIN
    IF EXISTS (
      select * from pg_catalog.pg_namespace where nspname = _schema) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent schema --> %s', _schema
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;


COMMIT;
