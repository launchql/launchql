-- Deploy schemas/status_public/tables/level_requirements/table to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/tables/levels/table 

BEGIN;

CREATE TABLE status_public.level_requirements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  name text NOT NULL,
  level text NOT NULL,
  required_count int DEFAULT 1,
  priority int DEFAULT 100,
  unique(name, level)
);

COMMENT ON TABLE status_public.level_requirements IS 'Requirements to achieve a level';
CREATE INDEX ON status_public.level_requirements (name, level, priority);
GRANT SELECT ON TABLE status_public.levels TO authenticated;

COMMIT;
