BEGIN;
CREATE EXTENSION IF NOT EXISTS citext;
DROP SCHEMA IF EXISTS app_public CASCADE;
CREATE SCHEMA app_public;
DROP SCHEMA IF EXISTS app_private CASCADE;
CREATE SCHEMA app_private;
GRANT USAGE ON SCHEMA app_private TO public;
GRANT USAGE ON SCHEMA app_public TO public;
CREATE TABLE app_public.goals (
    id serial PRIMARY KEY,
    title text,
    description text,
    tsv tsvector,
    stsv tsvector,
    tags text[]
);
GRANT SELECT ON app_public.goals TO public;
CREATE INDEX goals_tsv_idx1 ON app_public.goals USING GIN (tsv);
CREATE INDEX goals_tsv_idx2 ON app_public.goals USING GIN (tags);
CREATE FUNCTION app_private.goals_tsv_trigger1 ()
    RETURNS TRIGGER
    AS $CODEZ$
BEGIN
    NEW.tsv = setweight(to_tsvector('pg_catalog.simple', coalesce(array_to_string(NEW.tags::text[], ' '), '')), 'A') || setweight(to_tsvector('pg_catalog.simple', coalesce(NEW.title, '')), 'A') || setweight(to_tsvector('pg_catalog.english', coalesce(NEW.title, '')), 'B') || setweight(to_tsvector('pg_catalog.english', coalesce(NEW.description, '')), 'C');
    RETURN NEW;
END;
$CODEZ$
LANGUAGE plpgsql
VOLATILE;
CREATE FUNCTION app_private.goals_tsv_trigger2 ()
    RETURNS TRIGGER
    AS $CODEZ$
BEGIN
    NEW.stsv = setweight(to_tsvector('pg_catalog.simple', coalesce(NEW.title, '')), 'A');
    RETURN NEW;
END;
$CODEZ$
LANGUAGE plpgsql
VOLATILE;
CREATE TRIGGER goals_tsv_tg1
    BEFORE INSERT OR UPDATE ON app_public.goals
    FOR EACH ROW
    EXECUTE PROCEDURE app_private.goals_tsv_trigger1 ();
CREATE TRIGGER goals_tsv_tg2
    BEFORE INSERT OR UPDATE ON app_public.goals
    FOR EACH ROW
    EXECUTE PROCEDURE app_private.goals_tsv_trigger2 ();
INSERT INTO app_public.goals (tags, title, description)
    VALUES ('{plant,season}', 'seasons', 'Seasons which can''t over open shall likeness stars had said saw good winged Is morning every they''re from said light.'), ('{plants,food}', 'evenings', 'Appear evening that gathered saying. Sea subdue so fill stars. Bring is man divided behold fish their. Also won''t fowl.'), ('{happy,heaven}', 'heaven', 'Heaven. Tree creeping was. Gathered living dominion us likeness first subdue fill. Fowl him moveth fly also the is created.'), ('{great,things,god}', 'blessed', 'Beast moving blessed upon bearing brought the heaven of were saying earth. Beginning were fourth. Morning day creeping which, beast.'), ('{awesome,computers}', 'replenish', 'Of bearing female sea spirit blessed replenish. Subdue male green under life made all fly won''t living darkness sea appear.'), ('{technology,software}', 'green fowl', 'Second in years female given. Us firmament. She''d kind there let moved thing evening saying set whales a fowl heaven.');
COMMIT;

