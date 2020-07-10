-- Revert schemas/myschema/tables/sometable/table to pg
begin;
drop table myschema.sometable;
commit;
