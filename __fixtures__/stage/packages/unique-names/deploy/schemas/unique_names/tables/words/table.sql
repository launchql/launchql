-- Deploy schemas/unique_names/tables/words/table to pg

-- requires: schemas/unique_names/schema

BEGIN;

CREATE TABLE unique_names.words (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    type text,
    word text
);

COMMIT;
