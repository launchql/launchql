-- Deploy schemas/meta_public/tables/domains/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/apis/table 
-- requires: schemas/meta_public/tables/sites/table 
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE meta_public.domains (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    
    api_id uuid,
    site_id uuid,

    subdomain hostname,
    domain hostname,

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY (api_id) REFERENCES meta_public.apis (id) ON DELETE CASCADE,
    CONSTRAINT site_fkey FOREIGN KEY (site_id) REFERENCES meta_public.sites (id) ON DELETE CASCADE,
    CONSTRAINT one_route_chk CHECK (
        (api_id IS NULL AND site_id IS NULL) OR
        (api_id IS NULL AND site_id IS NOT NULL) OR
        (api_id IS NOT NULL AND site_id IS NULL)
    ),
    UNIQUE ( subdomain, domain )
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.domains IS E'@omit manyToMany';
CREATE INDEX domains_database_id_idx ON meta_public.domains ( database_id );

COMMENT ON CONSTRAINT api_fkey ON meta_public.domains IS E'@omit manyToMany';
CREATE INDEX domains_api_id_idx ON meta_public.domains ( api_id );

COMMENT ON CONSTRAINT site_fkey ON meta_public.domains IS E'@omit manyToMany';
CREATE INDEX domains_site_id_idx ON meta_public.domains ( site_id );

COMMIT;
