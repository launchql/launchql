-- Create schema
CREATE SCHEMA pgpm_migrate;

-- 1. Packages (minimal - just name and timestamp)
CREATE TABLE pgpm_migrate.packages (
    package         TEXT        PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Deployed changes (what's currently deployed)
CREATE TABLE pgpm_migrate.changes (
    change_id       TEXT        PRIMARY KEY,
    change_name     TEXT        NOT NULL,
    package         TEXT        NOT NULL REFERENCES pgpm_migrate.packages(package),
    script_hash     TEXT        NOT NULL,
    deployed_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(package, change_name),
    UNIQUE(package, script_hash)
);

-- 3. Dependencies (what depends on what)
CREATE TABLE pgpm_migrate.dependencies (
    change_id       TEXT        NOT NULL REFERENCES pgpm_migrate.changes(change_id) ON DELETE CASCADE,
    requires        TEXT        NOT NULL,
    PRIMARY KEY (change_id, requires)
);

-- 4. Event log (minimal history for rollback)
CREATE TABLE pgpm_migrate.events (
    event_id        SERIAL      PRIMARY KEY,
    event_type      TEXT        NOT NULL CHECK (event_type IN ('deploy', 'revert', 'verify')),
    change_name     TEXT        NOT NULL,
    package         TEXT        NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    error_message   TEXT,
    error_code      TEXT
);
