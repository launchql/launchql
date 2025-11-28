-- Additional custom types for testing custom type mappings
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.currency_type AS (
      code text,
      amount numeric
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metadata_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.metadata_type AS (
      data jsonb
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'timestamp_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.timestamp_type AS (
      value timestamptz
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_table' AND column_name = 'currency_field') THEN
    ALTER TABLE public.test_table ADD COLUMN currency_field public.currency_type;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_table' AND column_name = 'metadata_field') THEN
    ALTER TABLE public.test_table ADD COLUMN metadata_field public.metadata_type;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_table' AND column_name = 'timestamp_field') THEN
    ALTER TABLE public.test_table ADD COLUMN timestamp_field public.timestamp_type;
  END IF;
END $$;

GRANT USAGE ON TYPE public.currency_type TO authenticated;
GRANT USAGE ON TYPE public.metadata_type TO authenticated;
GRANT USAGE ON TYPE public.timestamp_type TO authenticated;

COMMIT;

