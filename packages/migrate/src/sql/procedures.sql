-- Register a project (auto-called by deploy if needed)
CREATE OR REPLACE PROCEDURE launchql_migrate.register_project(p_project TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO launchql_migrate.projects (project) 
    VALUES (p_project)
    ON CONFLICT (project) DO NOTHING;
END;
$$;

-- Check if a change is deployed
CREATE OR REPLACE FUNCTION launchql_migrate.is_deployed(
    p_project TEXT,
    p_change_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM launchql_migrate.changes 
        WHERE project = p_project 
        AND change_name = p_change_name
    );
$$;

-- Deploy a change
CREATE OR REPLACE PROCEDURE launchql_migrate.deploy(
    p_project TEXT,
    p_change_name TEXT,
    p_script_hash TEXT,
    p_requires TEXT[],
    p_deploy_sql TEXT,
    p_verify_sql TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_change_id TEXT;
BEGIN
    -- Ensure project exists
    CALL launchql_migrate.register_project(p_project);
    
    -- Generate simple ID
    v_change_id := encode(sha256((p_project || p_change_name || p_script_hash)::bytea), 'hex');
    
    -- Check if already deployed
    IF launchql_migrate.is_deployed(p_project, p_change_name) THEN
        RAISE EXCEPTION 'Change % already deployed in project %', p_change_name, p_project;
    END IF;
    
    -- Check dependencies
    IF p_requires IS NOT NULL THEN
        PERFORM 1 FROM unnest(p_requires) AS req
        WHERE NOT launchql_migrate.is_deployed(p_project, req);
        IF FOUND THEN
            RAISE EXCEPTION 'Missing required changes';
        END IF;
    END IF;
    
    -- Execute deploy
    BEGIN
        EXECUTE p_deploy_sql;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO launchql_migrate.events (event_type, change_name, project)
        VALUES ('fail', p_change_name, p_project);
        RAISE;
    END;
    
    -- Execute verify if provided
    IF p_verify_sql IS NOT NULL THEN
        BEGIN
            EXECUTE p_verify_sql;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO launchql_migrate.events (event_type, change_name, project)
            VALUES ('fail', p_change_name, p_project);
            RAISE EXCEPTION 'Verification failed';
        END;
    END IF;
    
    -- Record deployment
    INSERT INTO launchql_migrate.changes (change_id, change_name, project, script_hash)
    VALUES (v_change_id, p_change_name, p_project, p_script_hash);
    
    -- Record dependencies (INSERTED AFTER SUCCESSFUL DEPLOYMENT)
    IF p_requires IS NOT NULL THEN
        INSERT INTO launchql_migrate.dependencies (change_id, requires)
        SELECT v_change_id, req FROM unnest(p_requires) AS req;
    END IF;
    
    -- Log success
    INSERT INTO launchql_migrate.events (event_type, change_name, project)
    VALUES ('deploy', p_change_name, p_project);
END;
$$;

-- Revert a change
CREATE OR REPLACE PROCEDURE launchql_migrate.revert(
    p_project TEXT,
    p_change_name TEXT,
    p_revert_sql TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Check if deployed
    IF NOT launchql_migrate.is_deployed(p_project, p_change_name) THEN
        RAISE EXCEPTION 'Change % not deployed in project %', p_change_name, p_project;
    END IF;
    
    -- Check if other changes depend on this
    IF EXISTS (
        SELECT 1 FROM launchql_migrate.dependencies d
        JOIN launchql_migrate.changes c ON c.change_id = d.change_id
        WHERE d.requires = p_change_name
        AND c.project = p_project
    ) THEN
        RAISE EXCEPTION 'Other changes depend on %', p_change_name;
    END IF;
    
    -- Execute revert
    EXECUTE p_revert_sql;
    
    -- Remove from deployed
    DELETE FROM launchql_migrate.changes 
    WHERE project = p_project AND change_name = p_change_name;
    
    -- Log revert
    INSERT INTO launchql_migrate.events (event_type, change_name, project)
    VALUES ('revert', p_change_name, p_project);
END;
$$;

-- Verify a change
CREATE OR REPLACE FUNCTION launchql_migrate.verify(
    p_project TEXT,
    p_change_name TEXT,
    p_verify_sql TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
    EXECUTE p_verify_sql;
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- List deployed changes
CREATE OR REPLACE FUNCTION launchql_migrate.deployed_changes(
    p_project TEXT DEFAULT NULL
)
RETURNS TABLE(project TEXT, change_name TEXT, deployed_at TIMESTAMPTZ)
LANGUAGE sql STABLE AS $$
    SELECT project, change_name, deployed_at 
    FROM launchql_migrate.changes 
    WHERE p_project IS NULL OR project = p_project
    ORDER BY deployed_at;
$$;

-- Get deployment status
CREATE OR REPLACE FUNCTION launchql_migrate.status(
    p_project TEXT DEFAULT NULL
)
RETURNS TABLE(
    project TEXT,
    total_deployed INTEGER,
    last_change TEXT,
    last_deployed TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    WITH latest AS (
        SELECT DISTINCT ON (project) 
            project,
            change_name,
            deployed_at
        FROM launchql_migrate.changes
        WHERE p_project IS NULL OR project = p_project
        ORDER BY project, deployed_at DESC
    )
    SELECT 
        c.project,
        COUNT(*)::INTEGER AS total_deployed,
        l.change_name AS last_change,
        l.deployed_at AS last_deployed
    FROM launchql_migrate.changes c
    JOIN latest l ON l.project = c.project
    WHERE p_project IS NULL OR c.project = p_project
    GROUP BY c.project, l.change_name, l.deployed_at;
$$;