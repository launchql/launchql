BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
DROP SCHEMA IF EXISTS app_public CASCADE;

CREATE SCHEMA app_public;

CREATE TABLE app_public.projects (
    id serial PRIMARY KEY,
    name citext,
    description citext
);
COMMENT ON TABLE app_public.projects IS E'@i18n project_language_variations';

CREATE TABLE app_public.project_language_variations (
    id serial PRIMARY KEY,
    project_id int NOT NULL REFERENCES app_public.projects(id),
    lang_code citext,
    name citext,
    description citext,
    UNIQUE(project_id, lang_code)
);

INSERT INTO app_public.projects (id, name, description) VALUES
( 1, 'Proj1', 'project one' ),
( 2, 'Proj2', 'project two' ),
( 3, 'Proj3', 'project three' );

INSERT INTO app_public.project_language_variations (project_id, lang_code, name, description) VALUES
( 1, 'es', 'proj 1', 'proyecto uno' ),
( 2, 'es', 'proj 2', 'proyecto dos' ),
( 3, 'es', 'proj 3', 'proyecto tres' );

GRANT ALL ON SCHEMA app_public TO public;
GRANT ALL ON TABLE app_public.projects TO public;
GRANT ALL ON TABLE app_public.project_language_variations TO public;

COMMIT;

