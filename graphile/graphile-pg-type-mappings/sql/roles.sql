BEGIN;
DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = 'administrator') THEN
    CREATE ROLE administrator;
END IF;
    IF NOT EXISTS (
        SELECT
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = 'anonymous') THEN
    CREATE ROLE anonymous;
END IF;
    IF NOT EXISTS (
        SELECT
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
END IF;
END
$do$;
ALTER USER administrator WITH NOCREATEDB;
ALTER USER administrator WITH NOCREATEROLE;
ALTER USER administrator WITH NOLOGIN;
ALTER USER administrator WITH NOREPLICATION;
ALTER USER administrator WITH BYPASSRLS;
ALTER USER anonymous WITH NOCREATEDB;
ALTER USER anonymous WITH NOCREATEROLE;
ALTER USER anonymous WITH NOLOGIN;
ALTER USER anonymous WITH NOREPLICATION;
ALTER USER anonymous WITH NOBYPASSRLS;
ALTER USER authenticated WITH NOCREATEDB;
ALTER USER authenticated WITH NOCREATEROLE;
ALTER USER authenticated WITH NOLOGIN;
ALTER USER authenticated WITH NOREPLICATION;
ALTER USER authenticated WITH NOBYPASSRLS;
GRANT anonymous TO administrator;
GRANT authenticated TO administrator;
COMMIT;

