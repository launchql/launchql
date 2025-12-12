-- Deploy procedures/verify_constraint to pg
BEGIN;
-- https://stackoverflow.com/questions/20087259/how-to-find-whether-unique-key-constraint-exists-for-given-columns
CREATE FUNCTION verify_constraint (_table text, _name text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            c.conname,
            pg_get_constraintdef(c.oid)
        FROM
            pg_constraint c
        WHERE
            conname = _name
            AND c.conrelid = _table::regclass) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent constraint --> %', _name
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

