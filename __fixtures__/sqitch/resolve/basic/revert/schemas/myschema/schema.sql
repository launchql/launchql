-- Revert schemas/myschema/schema to pg
begin;
drop schema myschema;
commit;
