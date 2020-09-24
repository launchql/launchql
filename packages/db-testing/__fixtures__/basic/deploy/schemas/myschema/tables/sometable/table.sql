-- Deploy schemas/myschema/tables/sometable/table to pg
-- requires: schemas/myschema/schema

BEGIN;
CREATE TABLE myschema.sometable (
  id serial,
  name text
);
COMMIT;

