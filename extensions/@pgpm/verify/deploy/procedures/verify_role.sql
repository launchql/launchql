-- Deploy procedures/verify_role to pg
BEGIN;
CREATE FUNCTION verify_role (_user text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = _user) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent user --> %', _user
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

