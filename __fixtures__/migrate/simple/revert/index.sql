-- Revert test-simple:index from pg

BEGIN;

DROP INDEX test_app.idx_users_email;
DROP INDEX test_app.idx_users_created_at;

COMMIT;