-- Revert test-project:posts from pg

BEGIN;

DROP TABLE IF EXISTS app.posts CASCADE;

COMMIT;