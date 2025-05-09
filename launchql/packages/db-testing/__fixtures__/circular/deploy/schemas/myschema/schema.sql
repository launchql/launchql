-- Deploy schemas/myschema/schema to pg

-- requires: schemas/myschema/tables/sometable/table
begin;

create schema myschema;

commit;
