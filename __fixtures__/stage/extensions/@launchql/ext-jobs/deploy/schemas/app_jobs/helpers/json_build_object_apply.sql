-- Deploy schemas/app_jobs/helpers/json_build_object_apply to pg
-- requires: schemas/app_jobs/schema

BEGIN;
CREATE FUNCTION app_jobs.json_build_object_apply (arguments text[])
  RETURNS json
  AS $$
DECLARE
  arg text;
  _sql text;
  _res json;
  args text[];
BEGIN
  _sql = 'SELECT json_build_object(';
  FOR arg IN
  SELECT
    unnest(arguments)
    LOOP
      args = array_append(args, format('''%s''', arg));
    END LOOP;
  _sql = _sql || format('%s);', array_to_string(args, ','));
  EXECUTE _sql INTO _res;
  RETURN _res;
END;
$$
LANGUAGE 'plpgsql';
COMMIT;

