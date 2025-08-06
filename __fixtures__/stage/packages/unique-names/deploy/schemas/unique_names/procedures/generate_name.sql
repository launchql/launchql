-- Deploy schemas/unique_names/procedures/generate_name to pg

-- requires: schemas/unique_names/schema
-- requires: schemas/unique_names/tables/words/table

BEGIN;

CREATE FUNCTION unique_names.generate_name() returns text as $$

SELECT 

(SELECT word FROM unique_names.words 
WHERE type = 'adjectives'
OFFSET floor( random() * (select count(*) from unique_names.words WHERE type = 'adjectives' ) ) LIMIT 1)
|| ' ' ||
(SELECT word FROM unique_names.words 
WHERE type = 'colors'
OFFSET floor( random() * (select count(*) from unique_names.words WHERE type = 'colors' ) ) LIMIT 1)
|| ' ' ||
(SELECT word FROM unique_names.words 
WHERE type = 'animals'
OFFSET floor( random() * (select count(*) from unique_names.words WHERE type = 'animals' ) ) LIMIT 1)

$$
LANGUAGE 'sql' STABLE;

COMMIT;
