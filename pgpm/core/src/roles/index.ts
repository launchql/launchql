import { RoleMapping, TestUserCredentials } from '@pgpmjs/types';

/**
 * Safely escape a string for use as a SQL string literal.
 * Doubles single quotes and wraps in single quotes.
 */
function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Generate SQL to create base roles (anonymous, authenticated, administrator).
 * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
 * @param roles - Role mapping from getConnEnvOptions().roles!
 * @throws Error if roles is undefined or missing required properties
 */
export function generateCreateBaseRolesSQL(roles: RoleMapping): string {
  if (!roles) {
    throw new Error(
      'generateCreateBaseRolesSQL: roles parameter is undefined. ' +
      'Ensure getConnEnvOptions().roles is defined. ' +
      'Check that pgpm.config.js or pgpm.json does not set db.roles to undefined.'
    );
  }
  if (!roles.anonymous || !roles.authenticated || !roles.administrator) {
    throw new Error(
      'generateCreateBaseRolesSQL: roles is missing required properties. ' +
      `Got: anonymous=${roles.anonymous}, authenticated=${roles.authenticated}, administrator=${roles.administrator}. ` +
      'Ensure all role names are defined in your configuration.'
    );
  }
  const r = {
    anonymous: roles.anonymous,
    authenticated: roles.authenticated,
    administrator: roles.administrator,
    routingReader: roles.routingReader ?? 'routing_reader'
  };
  
  return `
BEGIN;
DO $do$
DECLARE
  v_anonymous text := ${sqlLiteral(r.anonymous)};
  v_authenticated text := ${sqlLiteral(r.authenticated)};
  v_administrator text := ${sqlLiteral(r.administrator)};
  v_routing_reader text := ${sqlLiteral(r.routingReader)};
BEGIN
  -- Create routing reader group role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_routing_reader) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I', v_routing_reader);
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
      WHEN unique_violation THEN
        NULL;
      WHEN insufficient_privilege THEN
        RAISE;
    END;
  END IF;

  -- Create anonymous role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_anonymous) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I', v_anonymous);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;
  
  -- Create authenticated role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_authenticated) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I', v_authenticated);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;
  
  -- Create administrator role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_administrator) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I', v_administrator);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;
  
  -- Set role attributes (safe to run even if role already exists)
  EXECUTE format('ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION NOBYPASSRLS', v_anonymous);
  EXECUTE format('ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION NOBYPASSRLS', v_authenticated);
  EXECUTE format('ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION BYPASSRLS', v_administrator);
  EXECUTE format('ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION NOBYPASSRLS', v_routing_reader);
END
$do$;
COMMIT;
`;
}

/**
 * Generate SQL to create the restricted `authenticated_client` role used by
 * SQL-level proxy clients (opt-in via `admin-users bootstrap --client`).
 *
 * The role inherits table/schema grants from `authenticated` and gets a
 * server-enforced statement_timeout baseline. Grant-level hardening such as
 * revoking set_config()/pg_notify() from PUBLIC is intentionally left to the
 * proxy deployment config, since those revokes affect every non-superuser
 * role in the database (the app server and job workers depend on both).
 *
 * @param roles - Role mapping from getConnEnvOptions().roles!
 * @param statementTimeout - Baseline statement_timeout for the role (default '15s')
 */
export function generateCreateClientRoleSQL(
  roles: RoleMapping,
  statementTimeout = '15s'
): string {
  if (!roles) {
    throw new Error(
      'generateCreateClientRoleSQL: roles parameter is undefined. ' +
      'Ensure getConnEnvOptions().roles is defined.'
    );
  }
  if (!roles.authenticated) {
    throw new Error(
      'generateCreateClientRoleSQL: roles is missing required properties. ' +
      `Got: authenticated=${roles.authenticated}. ` +
      'Ensure all role names are defined in your configuration.'
    );
  }
  const r = {
    authenticated: roles.authenticated,
    authenticatedClient: roles.authenticatedClient ?? 'authenticated_client'
  };

  return `
BEGIN;
DO $do$
DECLARE
  v_authenticated text := ${sqlLiteral(r.authenticated)};
  v_client text := ${sqlLiteral(r.authenticatedClient)};
  v_statement_timeout text := ${sqlLiteral(statementTimeout)};
BEGIN
  -- Create client role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_client) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I', v_client);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;

  -- Strip escalation attributes (safe to run even if role already exists)
  EXECUTE format('ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION NOBYPASSRLS', v_client);

  -- Inherit table/schema grants from authenticated
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_authenticated AND r2.rolname = v_client
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_authenticated, v_client);
    EXCEPTION
      WHEN unique_violation THEN
        -- 23505: Membership was granted concurrently; safe to ignore
        NULL;
      WHEN undefined_object THEN
        -- 42704: One of the roles doesn't exist; log notice and continue
        RAISE NOTICE 'Missing role when granting % to %', v_authenticated, v_client;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
      WHEN invalid_grant_operation THEN
        -- 0LP01: Must surface this error - invalid grant operation
        RAISE;
    END;
  END IF;

  -- Server-enforced baseline statement timeout for the client role
  EXECUTE format('ALTER ROLE %I SET statement_timeout = %L', v_client, v_statement_timeout);
END
$do$;
COMMIT;
`;
}

export interface CreateUserOptions {
  useLocksForRoles?: boolean;
  bypassRls?: boolean;
}

/**
 * Generate SQL to create or reconcile a login and grant base roles.
 * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
 * @param roles - Role mapping from getConnEnvOptions().roles!
 * @param options - Role locking and explicit RLS bypass (off by default).
 */
export function generateCreateUserSQL(
  username: string, 
  password: string, 
  roles: RoleMapping,
  { useLocksForRoles = false, bypassRls = false }: CreateUserOptions = {}
): string {
  if (!roles) {
    throw new Error(
      'generateCreateUserSQL: roles parameter is undefined. ' +
      'Ensure getConnEnvOptions().roles is defined.'
    );
  }
  if (!roles.anonymous || !roles.authenticated) {
    throw new Error(
      'generateCreateUserSQL: roles is missing required properties. ' +
      `Got: anonymous=${roles.anonymous}, authenticated=${roles.authenticated}.`
    );
  }
  const r = {
    anonymous: roles.anonymous,
    authenticated: roles.authenticated
  };
  const lockStatement = useLocksForRoles
    ? `PERFORM pg_advisory_xact_lock(42, hashtext(v_username));`
    : '';
  
  return `
BEGIN;
DO $do$
DECLARE
  v_username text := ${sqlLiteral(username)};
  v_password text := ${sqlLiteral(password)};
  v_anonymous text := ${sqlLiteral(r.anonymous)};
  v_authenticated text := ${sqlLiteral(r.authenticated)};
BEGIN
  ${lockStatement}
  -- Pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_username) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_username, v_password);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;

  EXECUTE format('ALTER ROLE %I LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION ${bypassRls ? 'BYPASSRLS' : 'NOBYPASSRLS'} PASSWORD %L', v_username, v_password);

  -- Grant anonymous to user
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_anonymous AND r2.rolname = v_username
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_anonymous, v_username);
    EXCEPTION
      WHEN unique_violation THEN
        -- 23505: Membership was granted concurrently; safe to ignore
        NULL;
      WHEN undefined_object THEN
        RAISE;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
      WHEN invalid_grant_operation THEN
        -- 0LP01: Must surface this error - invalid grant operation
        RAISE;
    END;
  END IF;

  -- Grant authenticated to user
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_authenticated AND r2.rolname = v_username
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_authenticated, v_username);
    EXCEPTION
      WHEN unique_violation THEN
        -- 23505: Membership was granted concurrently; safe to ignore
        NULL;
      WHEN undefined_object THEN
        RAISE;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
      WHEN invalid_grant_operation THEN
        -- 0LP01: Must surface this error - invalid grant operation
        RAISE;
    END;
  END IF;
END
$do$;
COMMIT;
`;
}

/**
 * Generate SQL to create test users with grants to base roles.
 * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
 * @param roles - Role mapping from getConnEnvOptions().roles!
 * @param connections - Test user credentials from getConnEnvOptions().connections!
 */
export function generateCreateTestUsersSQL(
  roles: RoleMapping,
  connections: TestUserCredentials
): string {
  if (!roles) {
    throw new Error(
      'generateCreateTestUsersSQL: roles parameter is undefined. ' +
      'Ensure getConnEnvOptions().roles is defined.'
    );
  }
  if (!roles.anonymous || !roles.authenticated || !roles.administrator) {
    throw new Error(
      'generateCreateTestUsersSQL: roles is missing required properties. ' +
      `Got: anonymous=${roles.anonymous}, authenticated=${roles.authenticated}, administrator=${roles.administrator}.`
    );
  }
  if (!connections) {
    throw new Error(
      'generateCreateTestUsersSQL: connections parameter is undefined. ' +
      'Ensure getConnEnvOptions().connections is defined.'
    );
  }
  if (!connections.app?.user || !connections.app?.password || !connections.admin?.user || !connections.admin?.password) {
    throw new Error(
      'generateCreateTestUsersSQL: connections is missing required properties. ' +
      'Ensure app.user, app.password, admin.user, and admin.password are defined.'
    );
  }
  const r = {
    anonymous: roles.anonymous,
    authenticated: roles.authenticated,
    administrator: roles.administrator
  };
  const users = {
    app: { user: connections.app.user, password: connections.app.password },
    admin: { user: connections.admin.user, password: connections.admin.password }
  };
  
  return `
BEGIN;
DO $do$
DECLARE
  v_app_user text := ${sqlLiteral(users.app.user)};
  v_app_user_password text := ${sqlLiteral(users.app.password)};
  v_app_admin text := ${sqlLiteral(users.admin.user)};
  v_app_admin_password text := ${sqlLiteral(users.admin.password)};
  v_anonymous text := ${sqlLiteral(r.anonymous)};
  v_authenticated text := ${sqlLiteral(r.authenticated)};
  v_administrator text := ${sqlLiteral(r.administrator)};
BEGIN
  -- Create app_user: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_app_user) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_app_user, v_app_user_password);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN unique_violation THEN NULL;
      WHEN insufficient_privilege THEN RAISE;
    END;
  END IF;
  
  -- Create app_admin: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_app_admin) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_app_admin, v_app_admin_password);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN unique_violation THEN NULL;
      WHEN insufficient_privilege THEN RAISE;
    END;
  END IF;

  -- Grant anonymous to app_user
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_anonymous AND r2.rolname = v_app_user
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_anonymous, v_app_user);
    EXCEPTION
      WHEN unique_violation THEN NULL;
      WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_anonymous, v_app_user;
      WHEN insufficient_privilege THEN RAISE;
      WHEN invalid_grant_operation THEN RAISE;
    END;
  END IF;

  -- Grant authenticated to app_user
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_authenticated AND r2.rolname = v_app_user
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_authenticated, v_app_user);
    EXCEPTION
      WHEN unique_violation THEN NULL;
      WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_authenticated, v_app_user;
      WHEN insufficient_privilege THEN RAISE;
      WHEN invalid_grant_operation THEN RAISE;
    END;
  END IF;

  -- Grant anonymous to administrator
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_anonymous AND r2.rolname = v_administrator
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_anonymous, v_administrator);
    EXCEPTION
      WHEN unique_violation THEN NULL;
      WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_anonymous, v_administrator;
      WHEN insufficient_privilege THEN RAISE;
      WHEN invalid_grant_operation THEN RAISE;
    END;
  END IF;

  -- Grant authenticated to administrator
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_authenticated AND r2.rolname = v_administrator
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_authenticated, v_administrator);
    EXCEPTION
      WHEN unique_violation THEN NULL;
      WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_authenticated, v_administrator;
      WHEN insufficient_privilege THEN RAISE;
      WHEN invalid_grant_operation THEN RAISE;
    END;
  END IF;

  -- Grant administrator to app_admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_administrator AND r2.rolname = v_app_admin
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_administrator, v_app_admin);
    EXCEPTION
      WHEN unique_violation THEN NULL;
      WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_administrator, v_app_admin;
      WHEN insufficient_privilege THEN RAISE;
      WHEN invalid_grant_operation THEN RAISE;
    END;
  END IF;
END
$do$;
COMMIT;
`;
}

/**
 * Generate SQL to grant a role to a user
 */
export function generateGrantRoleSQL(
  role: string, 
  user: string
): string {
  return `
DO $$
DECLARE
  v_user text := ${sqlLiteral(user)};
  v_role text := ${sqlLiteral(role)};
BEGIN
  -- Pre-check to avoid unnecessary GRANTs; still catch TOCTOU under concurrency
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members am
    JOIN pg_roles r1 ON am.roleid = r1.oid
    JOIN pg_roles r2 ON am.member = r2.oid
    WHERE r1.rolname = v_role AND r2.rolname = v_user
  ) THEN
    BEGIN
      EXECUTE format('GRANT %I TO %I', v_role, v_user);
    EXCEPTION
      WHEN unique_violation THEN
        -- 23505: Concurrent membership grant; safe to ignore
        NULL;
      WHEN undefined_object THEN
        -- 42704: Role or user missing; emit notice and continue
        RAISE NOTICE 'Missing role when granting % to %', v_role, v_user;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
      WHEN invalid_grant_operation THEN
        -- 0LP01: Must surface this error - invalid grant operation
        RAISE;
    END;
  END IF;
END
$$;
`;
}

/**
 * Generate SQL to remove a user and revoke grants.
 * Callers should use getConnEnvOptions() from @pgpmjs/env to get merged values.
 * @param roles - Role mapping from getConnEnvOptions().roles!
 * @param useLocksForRoles - Whether to use advisory locks (from getConnEnvOptions().useLocksForRoles)
 */
export function generateRemoveUserSQL(
  username: string, 
  roles: RoleMapping,
  useLocksForRoles = false
): string {
  if (!roles) {
    throw new Error(
      'generateRemoveUserSQL: roles parameter is undefined. ' +
      'Ensure getConnEnvOptions().roles is defined.'
    );
  }
  if (!roles.anonymous || !roles.authenticated) {
    throw new Error(
      'generateRemoveUserSQL: roles is missing required properties. ' +
      `Got: anonymous=${roles.anonymous}, authenticated=${roles.authenticated}.`
    );
  }
  const r = {
    anonymous: roles.anonymous,
    authenticated: roles.authenticated
  };
  const lockStatement = useLocksForRoles
    ? `PERFORM pg_advisory_xact_lock(42, hashtext(v_username));`
    : '';
  
  return `
BEGIN;
DO $do$
DECLARE
  v_username text := ${sqlLiteral(username)};
  v_anonymous text := ${sqlLiteral(r.anonymous)};
  v_authenticated text := ${sqlLiteral(r.authenticated)};
BEGIN
  ${lockStatement}
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = v_username
  ) THEN
    -- REVOKE anonymous membership
    BEGIN
      EXECUTE format('REVOKE %I FROM %I', v_anonymous, v_username);
    EXCEPTION
      WHEN undefined_object THEN
        -- 42704: Role doesn't exist; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;

    -- REVOKE authenticated membership
    BEGIN
      EXECUTE format('REVOKE %I FROM %I', v_authenticated, v_username);
    EXCEPTION
      WHEN undefined_object THEN
        -- 42704: Role doesn't exist; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;

    -- DROP ROLE
    BEGIN
      EXECUTE format('DROP ROLE %I', v_username);
    EXCEPTION
      WHEN undefined_object THEN
        -- 42704: Role doesn't exist; safe to ignore
        NULL;
      WHEN dependent_objects_still_exist THEN
        -- 2BP01: Must surface this error - role has dependent objects
        RAISE;
      WHEN object_in_use THEN
        -- 55006: Must surface this error - role is in use
        RAISE;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;
END
$do$;
COMMIT;
`;
}

/**
 * Generate SQL to create a user with grants to specified roles (for test harness)
 * @param useLocksForRoles - Whether to use advisory locks (from getConnEnvOptions().useLocksForRoles)
 */
export function generateCreateUserWithGrantsSQL(
  username: string,
  password: string,
  rolesToGrant: string[],
  useLocksForRoles = false
): string {
  const lockStatement = useLocksForRoles
    ? `PERFORM pg_advisory_xact_lock(42, hashtext(v_user));`
    : '';
  
  // Generate variable declarations for all roles
  const roleVarDeclarations = rolesToGrant.map((role, i) => 
    `  v_role_${i} text := ${sqlLiteral(role)};`
  ).join('\n');
  
  // Generate grant blocks using the variables
  const grantBlocks = rolesToGrant.map((_, i) => `
        -- Grant role ${i}
        IF NOT EXISTS (
          SELECT 1 FROM pg_auth_members am
          JOIN pg_roles r1 ON am.roleid = r1.oid
          JOIN pg_roles r2 ON am.member = r2.oid
          WHERE r1.rolname = v_role_${i} AND r2.rolname = v_user
        ) THEN
          BEGIN
            EXECUTE format('GRANT %I TO %I', v_role_${i}, v_user);
          EXCEPTION
            WHEN unique_violation THEN NULL;
            WHEN undefined_object THEN RAISE NOTICE 'Missing role when granting % to %', v_role_${i}, v_user;
            WHEN insufficient_privilege THEN RAISE;
            WHEN invalid_grant_operation THEN RAISE;
          END;
        END IF;`
  ).join('\n');
  
  return `
DO $$
DECLARE
  v_user text := ${sqlLiteral(username)};
  v_password text := ${sqlLiteral(password)};
${roleVarDeclarations}
BEGIN
  ${lockStatement}
  -- Create role: pre-check + exception handling for TOCTOU safety
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = v_user) THEN
    BEGIN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_user, v_password);
    EXCEPTION
      WHEN duplicate_object THEN
        -- 42710: Role already exists (race condition); safe to ignore
        NULL;
      WHEN unique_violation THEN
        -- 23505: Concurrent CREATE ROLE hit unique index; safe to ignore
        NULL;
      WHEN insufficient_privilege THEN
        -- 42501: Must surface this error - caller lacks permission
        RAISE;
    END;
  END IF;
${grantBlocks}
END $$;
`;
}
