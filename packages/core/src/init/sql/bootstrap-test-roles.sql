BEGIN;
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
    BEGIN
      PERFORM pg_advisory_xact_lock(42, hashtext('app_user'));
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'app_user', 'app_password');
    EXCEPTION
      WHEN duplicate_object OR unique_violation THEN
        NULL;
    END;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'app_admin') THEN
    BEGIN
      PERFORM pg_advisory_xact_lock(42, hashtext('app_admin'));
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', 'app_admin', 'admin_password');
    EXCEPTION
      WHEN duplicate_object OR unique_violation THEN
        NULL;
    END;
  END IF;
END
$do$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'anonymous' AND r2.rolname = 'app_user'
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'anonymous', 'app_user');
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'anonymous', 'app_user';
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'authenticated' AND r2.rolname = 'app_user'
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'authenticated', 'app_user');
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'authenticated', 'app_user';
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'anonymous' AND r2.rolname = 'administrator'
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'anonymous', 'administrator');
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'anonymous', 'administrator';
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'authenticated' AND r2.rolname = 'administrator'
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'authenticated', 'administrator');
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'authenticated', 'administrator';
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = 'administrator' AND r2.rolname = 'app_admin'
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', 'administrator', 'app_admin');
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
      WHEN undefined_object THEN
        RAISE NOTICE 'Missing role when granting % to %', 'administrator', 'app_admin';
    END;
  END IF;
END
$do$;
COMMIT;
