-- Deploy schemas/app_jobs/tables/scheduled_jobs/table to pg
-- requires: schemas/app_jobs/schema

BEGIN;
CREATE TABLE app_jobs.scheduled_jobs (
  id bigserial PRIMARY KEY,
  database_id uuid NOT NULL,
  queue_name text DEFAULT (public.gen_random_uuid ()) ::text,
  task_identifier text NOT NULL,
  payload json DEFAULT '{}' ::json NOT NULL,
  priority integer DEFAULT 0 NOT NULL,
  max_attempts integer DEFAULT 25 NOT NULL,
  key text,
  locked_at timestamptz,
  locked_by text,
  schedule_info json NOT NULL,
  last_scheduled timestamptz,
  last_scheduled_id bigint,
  CHECK (length(key) < 513),
  CHECK (length(task_identifier) < 127),
  CHECK (max_attempts > 0),
  CHECK (length(queue_name) < 127),
  CHECK (length(locked_by) > 3),
  UNIQUE (key)
);
COMMIT;

