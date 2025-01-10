-- Deploy procedures/tg_update_timestamps to pg

BEGIN;

CREATE FUNCTION tg_update_timestamps()
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
