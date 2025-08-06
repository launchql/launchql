-- Deploy roles/authenticated/role to pg

BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
    COMMENT ON ROLE authenticated IS 'Authenticated group';
    ALTER USER authenticated WITH NOCREATEDB;
    ALTER USER authenticated WITH NOCREATEROLE;
    ALTER USER authenticated WITH NOLOGIN;
    ALTER USER authenticated WITH NOBYPASSRLS;
END IF;
END
$$;
COMMIT;

