BEGIN;
DO $do$
BEGIN
  BEGIN
    CREATE ROLE administrator;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role was created concurrently; ignore.
      NULL;
  END;

  BEGIN
    CREATE ROLE anonymous;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role was created concurrently; ignore.
      NULL;
  END;

  BEGIN
    CREATE ROLE authenticated;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role was created concurrently; ignore.
      NULL;
  END;
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
DO $do$
BEGIN
  BEGIN
    EXECUTE format('GRANT %I TO %I', 'anonymous', 'administrator');
  EXCEPTION
    WHEN unique_violation THEN
      -- Membership was granted concurrently; ignore.
      NULL;
    WHEN undefined_object THEN
      -- One of the roles doesn't exist yet; order operations as needed.
      RAISE NOTICE 'Missing role when granting % to %', 'anonymous', 'administrator';
  END;

  BEGIN
    EXECUTE format('GRANT %I TO %I', 'authenticated', 'administrator');
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Missing role when granting % to %', 'authenticated', 'administrator';
  END;
END
$do$;
COMMIT;

