-- Deploy procedures/verify_extension to pg
BEGIN;
CREATE FUNCTION verify_extension (_extname text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_available_extensions
        WHERE
            name = _extname) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent extension --> %', _extname
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

