-- Deploy test-simple:index to pg
-- requires: table

BEGIN;

CREATE INDEX idx_users_email ON test_app.users(email);
CREATE INDEX idx_users_created_at ON test_app.users(created_at);

COMMIT;