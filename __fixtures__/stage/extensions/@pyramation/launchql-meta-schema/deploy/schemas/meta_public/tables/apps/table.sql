-- Deploy schemas/meta_public/tables/apps/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/sites/table 
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE meta_public.apps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    site_id uuid NOT NULL,
    name text,
    app_image image,
    app_store_link url,
    app_store_id text,
    app_id_prefix text,
    play_store_link url,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    UNIQUE ( site_id )
);

ALTER TABLE meta_public.apps ADD CONSTRAINT apps_site_id_fkey FOREIGN KEY ( site_id ) REFERENCES meta_public.sites ( id );
COMMENT ON CONSTRAINT apps_site_id_fkey ON meta_public.apps IS E'@omit manyToMany';
CREATE INDEX apps_site_id_idx ON meta_public.apps ( site_id );

COMMENT ON CONSTRAINT db_fkey ON meta_public.apps IS E'@omit manyToMany';
CREATE INDEX apps_database_id_idx ON meta_public.apps ( database_id );


COMMIT;
