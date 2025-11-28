-- Create custom PostgreSQL types for testing
CREATE TYPE public.email AS (
  value text
);

CREATE TYPE public.hostname AS (
  value text
);

CREATE TYPE public.url AS (
  value text
);

CREATE TYPE public.origin AS (
  value text
);

CREATE TYPE public.multiple_select AS (
  values text[]
);

CREATE TYPE public.single_select AS (
  value text
);

-- Create a custom type for testing custom mappings
CREATE TYPE public.custom_type AS (
  data jsonb
);

-- Create test tables using these types
CREATE TABLE public.test_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_field public.email,
  hostname_field public.hostname,
  url_field public.url,
  origin_field public.origin,
  multiple_select_field public.multiple_select,
  single_select_field public.single_select,
  custom_type_field public.custom_type
);

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_table TO authenticated;
GRANT USAGE ON TYPE public.email TO authenticated;
GRANT USAGE ON TYPE public.hostname TO authenticated;
GRANT USAGE ON TYPE public.url TO authenticated;
GRANT USAGE ON TYPE public.origin TO authenticated;
GRANT USAGE ON TYPE public.multiple_select TO authenticated;
GRANT USAGE ON TYPE public.single_select TO authenticated;
GRANT USAGE ON TYPE public.custom_type TO authenticated;

COMMIT;

-- Insert test data
INSERT INTO public.test_table (
  email_field,
  hostname_field,
  url_field,
  origin_field,
  multiple_select_field,
  single_select_field,
  custom_type_field
) VALUES (
  ROW('test@example.com')::public.email,
  ROW('example.com')::public.hostname,
  ROW('https://example.com')::public.url,
  ROW('https://example.com')::public.origin,
  ROW(ARRAY['option1', 'option2'])::public.multiple_select,
  ROW('option1')::public.single_select,
  ROW('{"key": "value"}'::jsonb)::public.custom_type
);

