-- Deploy schemas/myschema/tables/sometable/table to pg
-- requires: schemas/myschema/schema

begin;

create table myschema.sometable (
  id serial,
  name text
);

commit;
