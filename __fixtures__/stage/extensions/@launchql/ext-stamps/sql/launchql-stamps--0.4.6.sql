\echo Use "CREATE EXTENSION launchql-stamps" to load this file. \quit
CREATE SCHEMA stamps;

GRANT USAGE ON SCHEMA stamps TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA stamps 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE FUNCTION stamps.peoplestamps (  ) RETURNS trigger AS $EOFCODE$
BEGIN
    IF TG_OP = 'INSERT' THEN
      NEW.created_by = jwt_public.current_user_id();
      NEW.updated_by = jwt_public.current_user_id();
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.created_by = OLD.created_by;
      NEW.updated_by = jwt_public.current_user_id();
    END IF;
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql;

CREATE FUNCTION stamps.timestamps (  ) RETURNS trigger AS $EOFCODE$
BEGIN
    IF TG_OP = 'INSERT' THEN
      NEW.created_at = NOW();
      NEW.updated_at = NOW();
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.created_at = OLD.created_at;
      NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql;