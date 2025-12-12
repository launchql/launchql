-- Deploy schemas/meta_public/tables/site_themes/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/sites/table 
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE meta_public.site_themes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    site_id uuid NOT NULL,
    theme jsonb NOT NULL,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE
);

ALTER TABLE meta_public.site_themes ADD CONSTRAINT site_themes_site_id_fkey FOREIGN KEY ( site_id ) REFERENCES meta_public.sites ( id );
COMMENT ON CONSTRAINT site_themes_site_id_fkey ON meta_public.site_themes IS E'@omit manyToMany';
CREATE INDEX site_themes_site_id_idx ON meta_public.site_themes ( site_id );

COMMENT ON CONSTRAINT db_fkey ON meta_public.site_themes IS E'@omit manyToMany';
CREATE INDEX site_themes_database_id_idx ON meta_public.site_themes ( database_id );

COMMIT;
