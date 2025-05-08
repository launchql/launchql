-- Deploy schemas/collections_public/tables/full_text_search/table to pg

-- requires: schemas/collections_public/schema

BEGIN;

CREATE TABLE collections_public.full_text_search (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL DEFAULT uuid_nil(),
    
    table_id uuid NOT NULL,
    field_id uuid NOT NULL,
    field_ids uuid[] NOT NULL,
    weights text[] NOT NULL,
    langs text[] NOT NULL,
    --
  
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

    CHECK (cardinality(field_ids) = cardinality(weights) AND cardinality(weights) = cardinality(langs))
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.full_text_search IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.full_text_search IS E'@omit manyToMany';

CREATE INDEX full_text_search_table_id_idx ON collections_public.full_text_search ( table_id );
CREATE INDEX full_text_search_database_id_idx ON collections_public.full_text_search ( database_id );


COMMIT;
