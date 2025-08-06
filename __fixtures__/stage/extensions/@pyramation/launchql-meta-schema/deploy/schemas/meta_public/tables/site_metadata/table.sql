-- Deploy schemas/meta_public/tables/site_metadata/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/sites/table 
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE meta_public.site_metadata (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    site_id uuid NOT NULL,
    title text,
    description text,
    og_image image,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,

    CHECK ( character_length(title) <= 120 ),
    CHECK ( character_length(description) <= 120 )
);


ALTER TABLE meta_public.site_metadata ADD CONSTRAINT site_metadata_site_id_fkey FOREIGN KEY ( site_id ) REFERENCES meta_public.sites ( id );
COMMENT ON CONSTRAINT site_metadata_site_id_fkey ON meta_public.site_metadata IS E'@omit manyToMany';
CREATE INDEX site_metadata_site_id_idx ON meta_public.site_metadata ( site_id );

COMMENT ON CONSTRAINT db_fkey ON meta_public.site_metadata IS E'@omit manyToMany';
CREATE INDEX site_metadata_database_id_idx ON meta_public.site_metadata ( database_id );

COMMIT;
