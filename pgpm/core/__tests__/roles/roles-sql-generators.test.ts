import {
  generateCreateBaseRolesSQL,
  generateCreateClientRoleSQL,
  generateCreateTestUsersSQL,
  generateCreateUserSQL,
  generateRemoveUserSQL
} from '../../src/roles';

describe('Role SQL Generators - Input Validation', () => {
  describe('generateCreateBaseRolesSQL', () => {
    it('should throw an error when roles is undefined', () => {
      expect(() => {
        generateCreateBaseRolesSQL(undefined as any);
      }).toThrow('generateCreateBaseRolesSQL: roles parameter is undefined');
    });

    it('should throw an error when roles is null', () => {
      expect(() => {
        generateCreateBaseRolesSQL(null as any);
      }).toThrow('generateCreateBaseRolesSQL: roles parameter is undefined');
    });

    it('should throw an error when roles.anonymous is missing', () => {
      expect(() => {
        generateCreateBaseRolesSQL({
          authenticated: 'authenticated',
          administrator: 'administrator'
        });
      }).toThrow('generateCreateBaseRolesSQL: roles is missing required properties');
    });

    it('should throw an error when roles.authenticated is missing', () => {
      expect(() => {
        generateCreateBaseRolesSQL({
          anonymous: 'anonymous',
          administrator: 'administrator'
        });
      }).toThrow('generateCreateBaseRolesSQL: roles is missing required properties');
    });

    it('should throw an error when roles.administrator is missing', () => {
      expect(() => {
        generateCreateBaseRolesSQL({
          anonymous: 'anonymous',
          authenticated: 'authenticated'
        });
      }).toThrow('generateCreateBaseRolesSQL: roles is missing required properties');
    });

    it('should generate valid SQL when all roles are provided', () => {
      const sql = generateCreateBaseRolesSQL({
        anonymous: 'anon',
        authenticated: 'auth',
        administrator: 'admin'
      });
      expect(sql).toContain('anon');
      expect(sql).toContain('auth');
      expect(sql).toContain('admin');
      expect(sql).toContain('CREATE ROLE');
    });
  });

  describe('generateCreateBaseRolesSQL routing reader', () => {
    it('creates the routing reader group role with a default name, without login or RLS bypass', () => {
      const sql = generateCreateBaseRolesSQL({ anonymous: 'anon', authenticated: 'auth', administrator: 'admin' });
      expect(sql).toContain("v_routing_reader text := 'routing_reader'");
      expect(sql).toContain(
        "ALTER ROLE %I WITH NOCREATEDB NOSUPERUSER NOCREATEROLE NOLOGIN NOREPLICATION NOBYPASSRLS', v_routing_reader"
      );
    });

    it('honours a configured routing reader name', () => {
      const sql = generateCreateBaseRolesSQL({
        anonymous: 'anon', authenticated: 'auth', administrator: 'admin', routingReader: 'edge_reader'
      });
      expect(sql).toContain("v_routing_reader text := 'edge_reader'");
    });
  });

  describe('generateCreateClientRoleSQL', () => {
    it('should throw an error when roles is undefined', () => {
      expect(() => {
        generateCreateClientRoleSQL(undefined as any);
      }).toThrow('generateCreateClientRoleSQL: roles parameter is undefined');
    });

    it('should throw an error when roles.authenticated is missing', () => {
      expect(() => {
        generateCreateClientRoleSQL({
          authenticatedClient: 'authenticated_client'
        });
      }).toThrow('generateCreateClientRoleSQL: roles is missing required properties');
    });

    it('should default the client role name when roles.authenticatedClient is missing', () => {
      const sql = generateCreateClientRoleSQL({
        authenticated: 'authenticated'
      });
      expect(sql).toContain('authenticated_client');
      expect(sql).toContain('CREATE ROLE');
    });

    it('should generate valid SQL when all roles are provided', () => {
      const sql = generateCreateClientRoleSQL({
        authenticated: 'auth',
        authenticatedClient: 'auth_client'
      });
      expect(sql).toContain('auth');
      expect(sql).toContain('auth_client');
      expect(sql).toContain('CREATE ROLE');
      expect(sql).toContain('NOBYPASSRLS');
      expect(sql).toContain('GRANT %I TO %I');
      expect(sql).toContain('statement_timeout');
      expect(sql).not.toContain('REVOKE');
    });

    it('should apply a custom statement timeout', () => {
      const sql = generateCreateClientRoleSQL(
        { authenticated: 'authenticated', authenticatedClient: 'authenticated_client' },
        '30s'
      );
      expect(sql).toContain(`'30s'`);
    });

    it('should escape single quotes in role names', () => {
      const sql = generateCreateClientRoleSQL({
        authenticated: "auth'role",
        authenticatedClient: 'authenticated_client'
      });
      expect(sql).toContain("'auth''role'");
    });
  });

  describe('generateCreateUserSQL', () => {
    it('should throw an error when roles is undefined', () => {
      expect(() => {
        generateCreateUserSQL('testuser', 'testpass', undefined as any);
      }).toThrow('generateCreateUserSQL: roles parameter is undefined');
    });

    it('should throw an error when roles.anonymous is missing', () => {
      expect(() => {
        generateCreateUserSQL('testuser', 'testpass', {
          authenticated: 'authenticated'
        });
      }).toThrow('generateCreateUserSQL: roles is missing required properties');
    });

    it('should generate valid SQL when all required roles are provided', () => {
      const sql = generateCreateUserSQL('testuser', 'testpass', {
        anonymous: 'anon',
        authenticated: 'auth'
      });
      expect(sql).toContain('testuser');
      expect(sql).toContain('anon');
      expect(sql).toContain('auth');
    });

    it('reapplies the password even when the login already exists', () => {
      const sql = generateCreateUserSQL('testuser', "pass'word", {
        anonymous: 'anon',
        authenticated: 'auth'
      });
      const createEnd = sql.indexOf('END IF;');
      const passwordUpdate = sql.indexOf("EXECUTE format('ALTER ROLE %I LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', v_username, v_password);");
      expect(passwordUpdate).toBeGreaterThan(createEnd);
      expect(sql).toContain("v_password text := 'pass''word';");
    });

    it('enables RLS bypass only by explicit opt-in, including reruns', () => {
      const roles = { anonymous: 'anonymous', authenticated: 'authenticated' };
      expect(generateCreateUserSQL('testuser', 'testpass', roles)).toContain('NOBYPASSRLS PASSWORD');
      const sql = generateCreateUserSQL('testuser', 'testpass', roles, {
        bypassRls: true, useLocksForRoles: true
      });
      expect(sql).toContain('NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS PASSWORD');
      expect(sql).not.toContain('NOBYPASSRLS');
      expect(sql.indexOf("EXECUTE format('ALTER ROLE")).toBeGreaterThan(sql.indexOf('END IF;'));
      expect(sql).toContain('pg_advisory_xact_lock(42, hashtext(v_username))');
    });
  });

  describe('generateCreateTestUsersSQL', () => {
    const validRoles = {
      anonymous: 'anon',
      authenticated: 'auth',
      administrator: 'admin'
    };

    const validConnections = {
      app: { user: 'app_user', password: 'app_pass' },
      admin: { user: 'admin_user', password: 'admin_pass' }
    };

    it('should throw an error when roles is undefined', () => {
      expect(() => {
        generateCreateTestUsersSQL(undefined as any, validConnections);
      }).toThrow('generateCreateTestUsersSQL: roles parameter is undefined');
    });

    it('should throw an error when connections is undefined', () => {
      expect(() => {
        generateCreateTestUsersSQL(validRoles, undefined as any);
      }).toThrow('generateCreateTestUsersSQL: connections parameter is undefined');
    });

    it('should throw an error when connections.app is missing', () => {
      expect(() => {
        generateCreateTestUsersSQL(validRoles, {
          admin: { user: 'admin_user', password: 'admin_pass' }
        });
      }).toThrow('generateCreateTestUsersSQL: connections is missing required properties');
    });

    it('should throw an error when connections.admin is missing', () => {
      expect(() => {
        generateCreateTestUsersSQL(validRoles, {
          app: { user: 'app_user', password: 'app_pass' }
        });
      }).toThrow('generateCreateTestUsersSQL: connections is missing required properties');
    });

    it('should generate valid SQL when all parameters are provided', () => {
      const sql = generateCreateTestUsersSQL(validRoles, validConnections);
      expect(sql).toContain('app_user');
      expect(sql).toContain('admin_user');
      expect(sql).toContain('anon');
      expect(sql).toContain('auth');
      expect(sql).toContain('admin');
    });
  });

  describe('generateRemoveUserSQL', () => {
    it('should throw an error when roles is undefined', () => {
      expect(() => {
        generateRemoveUserSQL('testuser', undefined as any);
      }).toThrow('generateRemoveUserSQL: roles parameter is undefined');
    });

    it('should throw an error when roles.anonymous is missing', () => {
      expect(() => {
        generateRemoveUserSQL('testuser', {
          authenticated: 'authenticated'
        });
      }).toThrow('generateRemoveUserSQL: roles is missing required properties');
    });

    it('should generate valid SQL when all required roles are provided', () => {
      const sql = generateRemoveUserSQL('testuser', {
        anonymous: 'anon',
        authenticated: 'auth'
      });
      expect(sql).toContain('testuser');
      expect(sql).toContain('anon');
      expect(sql).toContain('auth');
      expect(sql).toContain('DROP ROLE');
    });
  });
});
