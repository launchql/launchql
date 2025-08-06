-- Deploy schemas/meta_public/tables/api_extensions/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/apis/table 

-- requires: schemas/collections_public/tables/database_extension/table 
-- requires: schemas/collections_public/tables/extension/table 
-- requires: schemas/collections_public/tables/database/table 


BEGIN;

-- NOTE: not directly mapping to extensions on purpose, to make it simple for api usage

CREATE TABLE meta_public.api_extensions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    schema_name text,
    database_id uuid NOT NULL,
    api_id uuid NOT NULL,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY (api_id) REFERENCES meta_public.apis (id) ON DELETE CASCADE,

    UNIQUE (schema_name, api_id)
);

-- WE DO WANT m2m!
-- COMMENT ON CONSTRAINT db_fkey ON meta_public.api_extensions IS E'@omit manyToMany';
-- COMMENT ON CONSTRAINT api_fkey ON meta_public.api_extensions IS E'@omit manyToMany';

CREATE INDEX api_extension_database_id_idx ON meta_public.api_extensions ( database_id );
CREATE INDEX api_extension_api_id_idx ON meta_public.api_extensions ( api_id );

COMMIT;
