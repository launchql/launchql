-- Deploy roles/administrator/role to pg

-- requires: roles/anonymous/role
-- requires: roles/authenticated/role

BEGIN;

BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'administrator') THEN
    CREATE ROLE administrator;
    COMMENT ON ROLE administrator IS 'Administration group';
    ALTER USER administrator WITH NOCREATEDB;
    ALTER USER administrator WITH NOCREATEROLE;
    ALTER USER administrator WITH NOLOGIN;
    ALTER USER administrator WITH BYPASSRLS;
    GRANT anonymous TO administrator;
    GRANT authenticated TO administrator;
END IF;
END
$$;
COMMIT;



COMMIT;
