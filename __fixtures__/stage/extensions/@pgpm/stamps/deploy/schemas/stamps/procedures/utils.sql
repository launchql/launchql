-- Deploy schemas/stamps/procedures/utils to pg

-- requires: schemas/stamps/schema

BEGIN;

CREATE FUNCTION stamps.peoplestamps()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE 'plpgsql';

CREATE FUNCTION stamps.timestamps()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE 'plpgsql';

COMMIT;
