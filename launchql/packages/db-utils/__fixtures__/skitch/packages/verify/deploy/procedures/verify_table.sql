-- Deploy procedures/verify_table to pg


BEGIN;

CREATE FUNCTION verify_table (_table text)
    RETURNS boolean
AS $$
BEGIN
    IF EXISTS (
      SELECT *
         FROM   information_schema.tables
         WHERE  table_schema = get_schema_from_str(_table)
         AND    table_name = get_entity_from_str(_table)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent table --> %s', _table
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

COMMIT;
