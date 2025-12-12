-- Deploy schemas/status_public/procedures/steps_required to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/tables/level_requirements/table 
-- requires: schemas/status_public/tables/user_achievements/table 

BEGIN;

-- good for debugging...

-- SELECT 
--       level_requirements.name,
--       level_requirements.level,
      
--       coalesce(user_achievements.count,0) as completed,
--       level_requirements.required_count as required,
--       -1*(coalesce(user_achievements.count,0)-level_requirements.required_count) as count
      
--     FROM
--       status_public.level_requirements 
--     FULL OUTER JOIN status_public.user_achievements ON (
--       user_achievements.name = level_requirements.name
--       AND user_achievements.user_id ='b9d22af1-62c7-43a5-b8c4-50630bbd4962'
--     )	
--     JOIN status_public.levels ON (level_requirements.level = levels.name)
-- ;

CREATE FUNCTION status_public.steps_required(
  vlevel text,
  vrole_id uuid DEFAULT jwt_public.current_user_id()
)
RETURNS SETOF status_public.level_requirements
  AS $$
BEGIN
  RETURN QUERY
  SELECT 
      level_requirements.id,
      level_requirements.name,
      level_requirements.level,
      -1*(coalesce(user_achievements.count,0)-level_requirements.required_count) as required_count,
      level_requirements.priority
    FROM
      status_public.level_requirements 
    FULL OUTER JOIN status_public.user_achievements ON (
      user_achievements.name = level_requirements.name
      AND user_achievements.user_id =vrole_id
    )	
    JOIN status_public.levels ON (level_requirements.level = levels.name)
  WHERE
    level_requirements.level = vlevel
    AND -1*(coalesce(user_achievements.count,0)-level_requirements.required_count) > 0
  ORDER BY priority ASC
;
END;
$$
LANGUAGE 'plpgsql'
STABLE;
COMMIT;

