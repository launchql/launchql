-- Deploy schemas/myschema/tables/sometable/table to pg
-- requires: schemas/myschema/schema
-- requires: schemas/myschema/somethingdoesntexist

begin;

create table myschema.sometable (
  id serial,
  name text
);

commit;
