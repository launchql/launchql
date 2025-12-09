-- Timestamp type for testing
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'timestamp_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.timestamp_type AS (
      value timestamptz
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_table' AND column_name = 'timestamp_field') THEN
    ALTER TABLE public.test_table ADD COLUMN timestamp_field public.timestamp_type;
  END IF;
END $$;

GRANT USAGE ON TYPE public.timestamp_type TO authenticated;

COMMIT;

