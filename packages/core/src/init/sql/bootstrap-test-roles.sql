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

GRANT anonymous TO app_user;
GRANT authenticated TO app_user;
GRANT anonymous TO administrator;
GRANT authenticated TO administrator;
GRANT administrator TO app_admin;
COMMIT;
