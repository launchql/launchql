-- Deploy procedures/verify_membership to pg

-- requires: procedures/list_memberships

BEGIN;
CREATE FUNCTION verify_membership (_user text, _role text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            list_memberships (_user)
        WHERE
            rolname = _role) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent member --> %', _user
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

