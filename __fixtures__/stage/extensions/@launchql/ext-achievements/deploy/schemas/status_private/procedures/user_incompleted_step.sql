-- Deploy schemas/status_private/procedures/user_incompleted_step to pg

-- requires: schemas/status_private/schema
-- requires: schemas/status_public/tables/user_steps/table

BEGIN;

CREATE FUNCTION status_private.user_incompleted_step ( 
  step text,
  user_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS void AS $EOFCODE$
BEGIN
  DELETE FROM status_public.user_steps s
    WHERE s.user_id = user_incompleted_step.user_id
    AND s.name = step;
  DELETE FROM status_public.user_achievements a
    WHERE a.user_id = user_incompleted_step.user_id
    AND a.name = step;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMIT;
