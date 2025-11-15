import { resolveDependencies } from '../../src/resolution/deps';
import { TestFixture } from '../../test-utils';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Header format compatibility', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = new TestFixture();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  const setupModule = (moduleDir: string, headerFormat: 'old' | 'new' | 'mixed') => {
    mkdirSync(join(moduleDir, 'deploy'), { recursive: true });
    
    const planContent = `%syntax-version=1.0.0
%project=test-module
%uri=https://github.com/test/test-module

schema 2024-01-01T00:00:00Z Test User <test@example.com> # Add schema
tables/users [schema] 2024-01-02T00:00:00Z Test User <test@example.com> # Add users table
`;
    writeFileSync(join(moduleDir, 'pgpm.plan'), planContent);
    
    if (headerFormat === 'old') {
      const schemaContent = `-- Deploy test-module:schema to pg

CREATE SCHEMA app;
`;
      const usersContent = `-- Deploy test-module:tables/users to pg
-- requires: schema

CREATE TABLE app.users (id serial primary key);
`;
      writeFileSync(join(moduleDir, 'deploy', 'schema.sql'), schemaContent);
      mkdirSync(join(moduleDir, 'deploy', 'tables'), { recursive: true });
      writeFileSync(join(moduleDir, 'deploy', 'tables', 'users.sql'), usersContent);
    } else if (headerFormat === 'new') {
      const schemaContent = `-- Deploy test-module:schema

CREATE SCHEMA app;
`;
      const usersContent = `-- Deploy test-module:tables/users
-- requires: schema

CREATE TABLE app.users (id serial primary key);
`;
      writeFileSync(join(moduleDir, 'deploy', 'schema.sql'), schemaContent);
      mkdirSync(join(moduleDir, 'deploy', 'tables'), { recursive: true });
      writeFileSync(join(moduleDir, 'deploy', 'tables', 'users.sql'), usersContent);
    } else {
      const schemaContent = `-- Deploy test-module:schema to pg

CREATE SCHEMA app;
`;
      const usersContent = `-- Deploy test-module:tables/users
-- requires: schema

CREATE TABLE app.users (id serial primary key);
`;
      writeFileSync(join(moduleDir, 'deploy', 'schema.sql'), schemaContent);
      mkdirSync(join(moduleDir, 'deploy', 'tables'), { recursive: true });
      writeFileSync(join(moduleDir, 'deploy', 'tables', 'users.sql'), usersContent);
    }
  };

  test('parses old header format with "to pg"', () => {
    const moduleDir = join(fixture.tempDir, 'test-old-format');
    setupModule(moduleDir, 'old');
    
    const result = resolveDependencies(moduleDir, 'test-module', { source: 'sql' });
    
    expect(result.resolved).toContain('schema');
    expect(result.resolved).toContain('tables/users');
    expect(result.resolved.indexOf('schema')).toBeLessThan(result.resolved.indexOf('tables/users'));
  });

  test('parses new header format without "to pg"', () => {
    const moduleDir = join(fixture.tempDir, 'test-new-format');
    setupModule(moduleDir, 'new');
    
    const result = resolveDependencies(moduleDir, 'test-module', { source: 'sql' });
    
    expect(result.resolved).toContain('schema');
    expect(result.resolved).toContain('tables/users');
    expect(result.resolved.indexOf('schema')).toBeLessThan(result.resolved.indexOf('tables/users'));
  });

  test('parses mixed header formats (backwards compatibility)', () => {
    const moduleDir = join(fixture.tempDir, 'test-mixed-format');
    setupModule(moduleDir, 'mixed');
    
    const result = resolveDependencies(moduleDir, 'test-module', { source: 'sql' });
    
    expect(result.resolved).toContain('schema');
    expect(result.resolved).toContain('tables/users');
    expect(result.resolved.indexOf('schema')).toBeLessThan(result.resolved.indexOf('tables/users'));
  });

  test('validates simple header format without project prefix', () => {
    const moduleDir = join(fixture.tempDir, 'test-simple-format');
    mkdirSync(join(moduleDir, 'deploy'), { recursive: true });
    
    const planContent = `%syntax-version=1.0.0
%project=test-module
%uri=https://github.com/test/test-module

init 2024-01-01T00:00:00Z Test User <test@example.com> # Initialize
`;
    writeFileSync(join(moduleDir, 'pgpm.plan'), planContent);
    
    const initContent = `-- Deploy init

SELECT 1;
`;
    writeFileSync(join(moduleDir, 'deploy', 'init.sql'), initContent);
    
    const result = resolveDependencies(moduleDir, 'test-module', { source: 'sql' });
    
    expect(result.resolved).toContain('init');
  });

  test('validates simple header format with old "to pg" suffix', () => {
    const moduleDir = join(fixture.tempDir, 'test-simple-old-format');
    mkdirSync(join(moduleDir, 'deploy'), { recursive: true });
    
    const planContent = `%syntax-version=1.0.0
%project=test-module
%uri=https://github.com/test/test-module

init 2024-01-01T00:00:00Z Test User <test@example.com> # Initialize
`;
    writeFileSync(join(moduleDir, 'pgpm.plan'), planContent);
    
    const initContent = `-- Deploy init to pg

SELECT 1;
`;
    writeFileSync(join(moduleDir, 'deploy', 'init.sql'), initContent);
    
    const result = resolveDependencies(moduleDir, 'test-module', { source: 'sql' });
    
    expect(result.resolved).toContain('init');
  });
});
