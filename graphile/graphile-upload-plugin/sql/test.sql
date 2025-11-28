BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

DROP SCHEMA IF EXISTS app_public CASCADE;
CREATE SCHEMA app_public;

-- ============================================================================
-- Custom Types (for type-based matching)
-- ============================================================================
-- Note: We use DOMAIN types based on jsonb/text to match resolver return format
-- Resolver returns:
--   - upload/image: { filename, mime, url } → stored as jsonb
--   - attachment: url (string) → stored as text

-- Upload type: resolver returns { filename, mime, url }
CREATE DOMAIN app_public.upload AS jsonb;

-- Attachment type: resolver returns url (string)
CREATE DOMAIN app_public.attachment AS text;

-- Image type: resolver returns { filename, mime, url }
-- Has default MIME type restrictions: image/jpg, image/jpeg, image/png, image/svg+xml
CREATE DOMAIN app_public.image AS jsonb;

-- ============================================================================
-- Table 1: users - Tests Smart Comments (@upload tag)
-- ============================================================================

CREATE TABLE app_public.users (
  id serial PRIMARY KEY,
  name citext NOT NULL,
  -- Text field with @upload tag (tag-based matching)
  -- Will generate avatarUrlUpload field
  avatar_url text,
  -- JSONB field with @upload tag (tag-based matching)
  -- Will generate profileDataUpload field
  profile_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Smart comment: tag-based upload field
COMMENT ON COLUMN app_public.users.avatar_url IS E'@upload';
COMMENT ON COLUMN app_public.users.profile_data IS E'@upload';

-- ============================================================================
-- Table 2: documents - Tests Type-based Matching + Multiple Upload Types
-- ============================================================================

CREATE TABLE app_public.documents (
  id serial PRIMARY KEY,
  title citext NOT NULL,
  
  -- Type-based matching: app_public.upload → JSON
  -- Resolver returns: { filename, mime, url }
  file_upload app_public.upload,
  
  -- Type-based matching: app_public.attachment → String
  -- Resolver returns: url (string)
  file_attachment app_public.attachment,
  
  -- Type-based matching: app_public.image → JSON
  -- Resolver returns: { filename, mime, url }
  -- Has default MIME restrictions for images
  file_image app_public.image,
  
  -- Tag-based matching: @upload tag on jsonb field
  -- Resolver returns: { filename, mime, url } (default for upload type)
  tagged_upload jsonb,
  
  -- Text field with type-based matching (if we add text type to config)
  -- Currently not configured, but shows the pattern
  document_url text,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Smart comment: tag-based upload field
COMMENT ON COLUMN app_public.documents.tagged_upload IS E'@upload';

-- ============================================================================
-- Table 3: media - Tests Another Upload Type
-- ============================================================================

CREATE TABLE app_public.media (
  id serial PRIMARY KEY,
  name citext NOT NULL,
  -- Type-based matching: app_public.upload
  upload_data app_public.upload,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Table 4: products - Tests MIME Type Restrictions
-- ============================================================================

CREATE TABLE app_public.products (
  id serial PRIMARY KEY,
  name citext NOT NULL,
  -- Image field with MIME type restrictions via smart comment
  product_image app_public.image,
  -- Upload field with custom MIME restrictions
  product_file app_public.upload,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Note: product_image and product_file already have type-based matching
-- (app_public.image and app_public.upload), so we don't add @upload tag here
-- to avoid ambiguity. The type-based matching will handle the upload functionality.
-- MIME type restrictions can be handled in the resolver based on the type.

-- ============================================================================
-- Table 5: profiles - Tests Mixed Scenarios
-- ============================================================================

CREATE TABLE app_public.profiles (
  id serial PRIMARY KEY,
  user_id integer,
  -- Multiple upload fields of different types
  avatar app_public.image,           -- Type-based: image
  resume app_public.attachment,      -- Type-based: attachment
  portfolio app_public.upload,       -- Type-based: upload
  -- Tag-based field
  custom_data jsonb,                 -- Tag-based: @upload
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN app_public.profiles.custom_data IS E'@upload';

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT ALL ON SCHEMA app_public TO public;
GRANT ALL ON TABLE app_public.users TO public;
GRANT ALL ON TABLE app_public.documents TO public;
GRANT ALL ON TABLE app_public.media TO public;
GRANT ALL ON TABLE app_public.products TO public;
GRANT ALL ON TABLE app_public.profiles TO public;

-- Grant sequence permissions
GRANT ALL ON SEQUENCE app_public.users_id_seq TO public;
GRANT ALL ON SEQUENCE app_public.documents_id_seq TO public;
GRANT ALL ON SEQUENCE app_public.media_id_seq TO public;
GRANT ALL ON SEQUENCE app_public.products_id_seq TO public;
GRANT ALL ON SEQUENCE app_public.profiles_id_seq TO public;

COMMIT;
