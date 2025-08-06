-- Deploy schemas/status_public/procedures/user_achieved to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/procedures/steps_required 
-- requires: schemas/status_public/tables/level_requirements/table 
-- requires: schemas/status_public/tables/user_achievements/table 

BEGIN;

CREATE FUNCTION status_public.user_achieved(
  vlevel text,
  vrole_id uuid DEFAULT jwt_public.current_user_id()
) returns boolean as $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) FROM
    status_public.steps_required(
      vlevel,
      vrole_id
    )
  INTO c;

  RETURN c <= 0;
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;
