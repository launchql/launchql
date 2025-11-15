-- Register a package (auto-called by deploy if needed)
CREATE PROCEDURE pgpm_migrate.register_package(p_package TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO pgpm_migrate.packages (package) 
    VALUES (p_package)
    ON CONFLICT (package) DO NOTHING;
END;
$$;

-- Check if a change is deployed (handles both local and cross-package dependencies)
CREATE FUNCTION pgpm_migrate.is_deployed(
    p_package TEXT,
    p_change_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_actual_package TEXT;
    v_actual_change TEXT;
    v_colon_pos INT;
BEGIN
    -- Check if change_name contains a package prefix (cross-package dependency)
    v_colon_pos := position(':' in p_change_name);
    
    IF v_colon_pos > 0 THEN
        -- Split into package and change name
        v_actual_package := substring(p_change_name from 1 for v_colon_pos - 1);
        v_actual_change := substring(p_change_name from v_colon_pos + 1);
    ELSE
        -- Use provided package as default
        v_actual_package := p_package;
        v_actual_change := p_change_name;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM pgpm_migrate.changes 
        WHERE package = v_actual_package 
        AND change_name = v_actual_change
    );
END;
$$;

-- Deploy a change
CREATE PROCEDURE pgpm_migrate.deploy(
    p_package TEXT,
    p_change_name TEXT,
    p_script_hash TEXT,
    p_requires TEXT[],
    p_deploy_sql TEXT,
    p_log_only BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_change_id TEXT;
BEGIN
    -- Ensure package exists
    CALL pgpm_migrate.register_package(p_package);
    
    -- Generate simple ID
    v_change_id := encode(sha256((p_package || p_change_name || p_script_hash)::bytea), 'hex');
    
    -- Check if already deployed
    IF pgpm_migrate.is_deployed(p_package, p_change_name) THEN
        -- Check if it's the same script (by hash)
        IF EXISTS (
            SELECT 1 FROM pgpm_migrate.changes 
            WHERE package = p_package 
            AND change_name = p_change_name 
            AND script_hash = p_script_hash
        ) THEN
            -- Same change with same content, skip silently
            RETURN;
        ELSE
            -- Different content, this is an error
            RAISE EXCEPTION 'Change % already deployed in package % with different content', p_change_name, p_package;
        END IF;
    END IF;
    
    -- Check dependencies
    IF p_requires IS NOT NULL THEN
        DECLARE
            missing_changes TEXT[];
        BEGIN
            SELECT array_agg(req) INTO missing_changes
            FROM unnest(p_requires) AS req
            WHERE NOT pgpm_migrate.is_deployed(p_package, req);
            
            IF array_length(missing_changes, 1) > 0 THEN
                RAISE EXCEPTION 'Missing required changes for %: %', p_change_name, array_to_string(missing_changes, ', ');
            END IF;
        END;
    END IF;
    
    -- Execute deploy (skip if log-only mode)
    IF NOT p_log_only THEN
        BEGIN
            EXECUTE p_deploy_sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE;
        END;
    END IF;
    
    -- Record deployment
    INSERT INTO pgpm_migrate.changes (change_id, change_name, package, script_hash)
    VALUES (v_change_id, p_change_name, p_package, p_script_hash);
    
    -- Record dependencies (INSERTED AFTER SUCCESSFUL DEPLOYMENT)
    IF p_requires IS NOT NULL THEN
        INSERT INTO pgpm_migrate.dependencies (change_id, requires)
        SELECT v_change_id, req FROM unnest(p_requires) AS req;
    END IF;
    
    -- Log success
    INSERT INTO pgpm_migrate.events (event_type, change_name, package)
    VALUES ('deploy', p_change_name, p_package);
END;
$$;

-- Revert a change
CREATE PROCEDURE pgpm_migrate.revert(
    p_package TEXT,
    p_change_name TEXT,
    p_revert_sql TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Check if deployed
    IF NOT pgpm_migrate.is_deployed(p_package, p_change_name) THEN
        RAISE EXCEPTION 'Change % not deployed in package %', p_change_name, p_package;
    END IF;
    
    -- Check if other changes depend on this (including cross-package dependencies)
    IF EXISTS (
        SELECT 1 FROM pgpm_migrate.dependencies d
        JOIN pgpm_migrate.changes c ON c.change_id = d.change_id
        WHERE (
            -- Local dependency within same package
            (d.requires = p_change_name AND c.package = p_package)
            OR
            -- Cross-package dependency
            (d.requires = p_package || ':' || p_change_name)
        )
    ) THEN
        -- Get list of dependent changes for better error message
        DECLARE
            dependent_changes TEXT;
        BEGIN
            SELECT string_agg(
                CASE 
                    WHEN d.requires = p_change_name THEN c.change_name
                    ELSE c.package || ':' || c.change_name
                END, 
                ', '
            ) INTO dependent_changes
            FROM pgpm_migrate.dependencies d
            JOIN pgpm_migrate.changes c ON c.change_id = d.change_id
            WHERE (
                (d.requires = p_change_name AND c.package = p_package)
                OR
                (d.requires = p_package || ':' || p_change_name)
            );
            
            RAISE EXCEPTION 'Cannot revert %: required by %', p_change_name, dependent_changes;
        END;
    END IF;
    
    -- Execute revert
    EXECUTE p_revert_sql;
    
    -- Remove from deployed
    DELETE FROM pgpm_migrate.changes 
    WHERE package = p_package AND change_name = p_change_name;
    
    -- Log revert
    INSERT INTO pgpm_migrate.events (event_type, change_name, package)
    VALUES ('revert', p_change_name, p_package);
END;
$$;

-- Verify a change
CREATE FUNCTION pgpm_migrate.verify(
    p_package TEXT,
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
CREATE FUNCTION pgpm_migrate.deployed_changes(
    p_package TEXT DEFAULT NULL
)
RETURNS TABLE(package TEXT, change_name TEXT, deployed_at TIMESTAMPTZ)
LANGUAGE sql STABLE AS $$
    SELECT package, change_name, deployed_at 
    FROM pgpm_migrate.changes 
    WHERE p_package IS NULL OR package = p_package
    ORDER BY deployed_at;
$$;

-- Get changes that depend on a given change
CREATE FUNCTION pgpm_migrate.get_dependents(
    p_package TEXT,
    p_change_name TEXT
)
RETURNS TABLE(package TEXT, change_name TEXT, dependency TEXT)
LANGUAGE sql STABLE AS $$
    SELECT c.package, c.change_name, d.requires as dependency
    FROM pgpm_migrate.dependencies d
    JOIN pgpm_migrate.changes c ON c.change_id = d.change_id
    WHERE (
        -- Local dependency within same package
        (d.requires = p_change_name AND c.package = p_package)
        OR
        -- Cross-package dependency
        (d.requires = p_package || ':' || p_change_name)
    )
    ORDER BY c.package, c.change_name;
$$;

-- Get deployment status
CREATE FUNCTION pgpm_migrate.status(
    p_package TEXT DEFAULT NULL
)
RETURNS TABLE(
    package TEXT,
    total_deployed INTEGER,
    last_change TEXT,
    last_deployed TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    WITH latest AS (
        SELECT DISTINCT ON (package) 
            package,
            change_name,
            deployed_at
        FROM pgpm_migrate.changes
        WHERE p_package IS NULL OR package = p_package
        ORDER BY package, deployed_at DESC
    )
    SELECT 
        c.package,
        COUNT(*)::INTEGER AS total_deployed,
        l.change_name AS last_change,
        l.deployed_at AS last_deployed
    FROM pgpm_migrate.changes c
    JOIN latest l ON l.package = c.package
    WHERE p_package IS NULL OR c.package = p_package
    GROUP BY c.package, l.change_name, l.deployed_at;
$$;
