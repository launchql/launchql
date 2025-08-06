-- Deploy schemas/unique_names/tables/words/indexes/words_type_idx to pg

-- requires: schemas/unique_names/schema
-- requires: schemas/unique_names/tables/words/table

BEGIN;

CREATE INDEX words_type_idx ON unique_names.words (
 type
);

COMMIT;
