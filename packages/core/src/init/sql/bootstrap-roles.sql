BEGIN;
DO $do$
BEGIN
  -- anonymous
  BEGIN
    EXECUTE format('CREATE ROLE %I', 'anonymous');
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
  
  -- authenticated
  BEGIN
    EXECUTE format('CREATE ROLE %I', 'authenticated');
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
  
  -- administrator
  BEGIN
    EXECUTE format('CREATE ROLE %I', 'administrator');
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
END
$do$;

-- Set role attributes (safe to run even if role already exists)
ALTER USER anonymous WITH NOCREATEDB;
ALTER USER anonymous WITH NOSUPERUSER;
ALTER USER anonymous WITH NOCREATEROLE;
ALTER USER anonymous WITH NOLOGIN;
ALTER USER anonymous WITH NOREPLICATION;
ALTER USER anonymous WITH NOBYPASSRLS;

ALTER USER authenticated WITH NOCREATEDB;
ALTER USER authenticated WITH NOSUPERUSER;
ALTER USER authenticated WITH NOCREATEROLE;
ALTER USER authenticated WITH NOLOGIN;
ALTER USER authenticated WITH NOREPLICATION;
ALTER USER authenticated WITH NOBYPASSRLS;

ALTER USER administrator WITH NOCREATEDB;
ALTER USER administrator WITH NOSUPERUSER;
ALTER USER administrator WITH NOCREATEROLE;
ALTER USER administrator WITH NOLOGIN;
ALTER USER administrator WITH NOREPLICATION;
-- they CAN bypass RLS
ALTER USER administrator WITH BYPASSRLS;
COMMIT;