-- Create schema
CREATE SCHEMA launchql_migrate;

-- 1. Projects (minimal - just name and timestamp)
CREATE TABLE launchql_migrate.projects (
    project         TEXT        PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Deployed changes (what's currently deployed)
CREATE TABLE launchql_migrate.changes (
    change_id       TEXT        PRIMARY KEY,
    change_name     TEXT        NOT NULL,
    project         TEXT        NOT NULL REFERENCES launchql_migrate.projects(project),
    script_hash     TEXT        NOT NULL,
    deployed_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(project, change_name),
    UNIQUE(project, script_hash)
);

CREATE TABLE launchql_migrate.tags (
    project         TEXT        NOT NULL REFERENCES launchql_migrate.projects(project),
    tag_name        TEXT        NOT NULL,
    change_name     TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (project, tag_name)
);

CREATE TABLE launchql_migrate.debug_log (
    id              SERIAL      PRIMARY KEY,
    message         TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Dependencies (what depends on what)
CREATE TABLE launchql_migrate.dependencies (
    change_id       TEXT        NOT NULL REFERENCES launchql_migrate.changes(change_id) ON DELETE CASCADE,
    requires        TEXT        NOT NULL,
    PRIMARY KEY (change_id, requires)
);

-- 5. Event log (minimal history for rollback)
CREATE TABLE launchql_migrate.events (
    event_id        SERIAL      PRIMARY KEY,
    event_type      TEXT        NOT NULL CHECK (event_type IN ('deploy', 'revert', 'fail')),
    change_name     TEXT        NOT NULL,
    project         TEXT        NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
