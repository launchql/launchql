-- Deploy procedures/verify_index to pg


BEGIN;

CREATE FUNCTION verify_index (_table text, _index text)
    RETURNS boolean
AS $$
BEGIN
    IF EXISTS (
            SELECT
                list_indexes (_table, _index)
              ) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent index --> %s', _index
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

COMMIT;
