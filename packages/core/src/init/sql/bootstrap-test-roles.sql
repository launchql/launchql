BEGIN;
DO $do$
BEGIN
  BEGIN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'app_user', 'app_password');
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
  
  BEGIN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'app_admin', 'admin_password');
  EXCEPTION
    WHEN duplicate_object THEN
      -- Role already exists; optionally sync attributes here with ALTER ROLE
      NULL;
  END;
END
$do$;

DO $do$
BEGIN
  BEGIN
    EXECUTE format('GRANT %I TO %I', 'anonymous', 'app_user');
  EXCEPTION
    WHEN unique_violation THEN
      -- Membership was granted concurrently; ignore.
      NULL;
    WHEN undefined_object THEN
      -- One of the roles doesn't exist yet; order operations as needed.
      RAISE NOTICE 'Missing role when granting % to %', 'anonymous', 'app_user';
  END;

  BEGIN
    EXECUTE format('GRANT %I TO %I', 'authenticated', 'app_user');
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Missing role when granting % to %', 'authenticated', 'app_user';
  END;

  BEGIN
    EXECUTE format('GRANT %I TO %I', 'anonymous', 'administrator');
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
    WHEN undefined_object THEN
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

  BEGIN
    EXECUTE format('GRANT %I TO %I', 'administrator', 'app_admin');
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Missing role when granting % to %', 'administrator', 'app_admin';
  END;
END
$do$;
COMMIT;
