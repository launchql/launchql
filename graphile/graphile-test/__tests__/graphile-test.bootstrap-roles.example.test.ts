/**
 * Example: Using pgpm admin-users bootstrap method instead of roles.sql
 * 
 * This demonstrates how to use LaunchQLInit.bootstrapRoles() via the
 * bootstrapRoles() seed adapter, which is equivalent to running:
 *   pgpm admin-users bootstrap
 * 
 * Note: The bootstrapRoles() adapter also adds role inheritance
 * (GRANT anonymous/authenticated TO administrator) which is needed
 * for testing but not included in bootstrap-roles.sql
 */

import gql from 'graphql-tag';
import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { bootstrapRoles } from '../src/seed-roles';
import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from '../src/types';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections(
    {
      schemas,
      authRole: 'authenticated'
    },
    [
      // Use bootstrapRoles() instead of seed.sqlfile([sql('roles.sql')])
      bootstrapRoles(),
      seed.sqlfile([
        sql('test.sql'),  // Must be before grants.sql - creates the schema
        sql('grants.sql') // Depends on test.sql creating app_public schema
      ])
    ]
  );

  ({ db, query, teardown } = connections);
});

beforeEach(() => db.beforeEach());

beforeEach(async () => {
  db.setContext({
    role: 'authenticated',
    'myapp.user_id': '123'
  });
});

afterEach(() => db.afterEach());

afterAll(async () => {
  await teardown();
});

it('creates roles using pgpm admin-users bootstrap method', async () => {
  // Verify roles exist
  const rolesResult = await db.query(`
    SELECT rolname 
    FROM pg_roles 
    WHERE rolname IN ('anonymous', 'authenticated', 'administrator')
    ORDER BY rolname
  `);
  
  expect(rolesResult.rows).toHaveLength(3);
  expect(rolesResult.rows.map(r => r.rolname)).toEqual([
    'administrator',
    'anonymous',
    'authenticated'
  ]);
  
  // Verify role inheritance (administrator inherits from anonymous and authenticated)
  // In pg_auth_members: roleid = the role being granted, member = the role receiving it
  // So GRANT anonymous TO administrator means: roleid=anonymous, member=administrator
  // To find what administrator inherits, we look for member=administrator
  const inheritanceResult = await db.query(`
    SELECT 
      r.rolname AS inherited_role
    FROM pg_roles r
    JOIN pg_auth_members am ON r.oid = am.roleid
    JOIN pg_roles m ON am.member = m.oid
    WHERE m.rolname = 'administrator'
    ORDER BY r.rolname
  `);
  
  expect(inheritanceResult.rows).toHaveLength(2);
  expect(inheritanceResult.rows.map(r => r.inherited_role)).toEqual([
    'anonymous',
    'authenticated'
  ]);
});

it('works with GraphQL queries using authenticated role', async () => {
  // Set context before query (same pattern as graphile-test.roles.test.ts)
  db.setContext({ role: 'authenticated', 'myapp.user_id': '123' });
  
  const GET_CONTEXT = gql`
    query {
      currentRole: currentSetting(name: "role")
      userId: currentSetting(name: "myapp.user_id")
    }
  `;

  const res: any = await query(GET_CONTEXT);

  if(res.errors) {
    console.error('GraphQL errors:', res.errors);
    throw new Error(`GraphQL query failed: ${JSON.stringify(res.errors, null, 2)}`);
  }

  expect(res.data).toBeDefined();
  expect(res.data.currentRole).toBe('authenticated');
  expect(res.data.userId).toBe('123');
});

