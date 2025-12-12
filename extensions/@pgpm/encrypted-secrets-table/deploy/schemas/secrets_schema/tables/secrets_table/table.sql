-- Deploy schemas/secrets_schema/tables/secrets_table/table to pg

-- requires: schemas/secrets_schema/schema

BEGIN;

CREATE TABLE secrets_schema.secrets_table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  secrets_owned_field uuid NOT NULL,
  name text NOT NULL,
  secrets_value_field bytea NULL,
  secrets_enc_field text NULL,
  UNIQUE(secrets_owned_field, name)
);

COMMIT;
