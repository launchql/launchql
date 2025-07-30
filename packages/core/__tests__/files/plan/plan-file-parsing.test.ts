import { mkdirSync, rmSync,writeFileSync } from 'fs';
import { join } from 'path';

import { 
  getChanges,
  getLatestChange,
  parsePlanFile, 
  parsePlanFileSimple,
  resolveReference
} from '../../../src/files';
import { ExtendedPlanFile } from '../../../src/files/types';

describe('Plan Parser', () => {
  const testDir = join(__dirname, 'test-plans');

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('parsePlanFile', () => {
    it('should parse a simple plan file', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project
%uri=https://github.com/test/project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com> # Create users table
posts_table [users_table] 2024-01-02T00:00:00Z Developer <dev@example.com> # Create posts table
`;
      const planPath = join(testDir, 'simple.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data!.package).toBe('test-project');
      expect(result.data!.uri).toBe('https://github.com/test/project');
      expect(result.data!.changes).toHaveLength(2);
      expect(result.data!.changes[0].name).toBe('users_table');
      expect(result.data!.changes[1].name).toBe('posts_table');
      expect(result.data!.changes[1].dependencies).toEqual(['users_table']);
    });

    it('should parse tags', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com> # Create users table
@v1.0.0 2024-01-02T00:00:00Z Developer <dev@example.com> # Version 1.0.0
posts_table [users_table] 2024-01-03T00:00:00Z Developer <dev@example.com> # Create posts table
`;
      const planPath = join(testDir, 'with-tags.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.data!.tags).toHaveLength(1);
      expect(result.data!.tags[0].name).toBe('v1.0.0');
      expect(result.data!.tags[0].change).toBe('users_table');
      expect(result.data!.tags[0].comment).toBe('Version 1.0.0');
    });

    it('should report error for conflicts', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com> # Create users table
posts_table [users_table !old_posts] 2024-01-02T00:00:00Z Developer <dev@example.com> # Create posts table
`;
      const planPath = join(testDir, 'with-conflicts.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      // Conflicts are not supported, so we expect an error
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid dependency reference: !old_posts');
    });

    it('should report errors for invalid syntax', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

invalid line without timestamp
users_table 2024-01-01T00:00:00Z Developer <dev@example.com>
`;
      const planPath = join(testDir, 'invalid.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].line).toBe(4);
    });

    it('should validate change names', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users-table 2024-01-01T00:00:00Z Developer <dev@example.com> # Valid name
users@table 2024-01-02T00:00:00Z Developer <dev@example.com> # Invalid name
`;
      const planPath = join(testDir, 'invalid-names.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid change name'))).toBe(true);
    });

    it('should validate dependencies', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com>
posts_table [@invalid@tag users_table] 2024-01-02T00:00:00Z Developer <dev@example.com>
`;
      const planPath = join(testDir, 'invalid-deps.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFile(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid dependency'))).toBe(true);
    });
  });

  describe('parsePlanFileSimple', () => {
    it('should parse without validation and without tags', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com>
@v1.0.0 2024-01-02T00:00:00Z Developer <dev@example.com>
posts_table 2024-01-03T00:00:00Z Developer <dev@example.com>
`;
      const planPath = join(testDir, 'simple-parse.plan');
      writeFileSync(planPath, planContent);

      const result = parsePlanFileSimple(planPath);
      
      expect(result.package).toBe('test-project');
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0].name).toBe('users_table');
      expect(result.changes[1].name).toBe('posts_table');
      // Tags should not be included in simple parse
      expect((result as any).tags).toBeUndefined();
    });
  });

  describe('getChanges', () => {
    it('should return all change names', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com>
@v1.0.0 2024-01-02T00:00:00Z Developer <dev@example.com>
posts_table 2024-01-03T00:00:00Z Developer <dev@example.com>
comments_table 2024-01-04T00:00:00Z Developer <dev@example.com>
`;
      const planPath = join(testDir, 'get-changes.plan');
      writeFileSync(planPath, planContent);

      const changes = getChanges(planPath);
      
      expect(changes).toEqual(['users_table', 'posts_table', 'comments_table']);
    });
  });

  describe('getLatestChange', () => {
    it('should return the last change name', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project

users_table 2024-01-01T00:00:00Z Developer <dev@example.com>
posts_table 2024-01-02T00:00:00Z Developer <dev@example.com>
comments_table 2024-01-03T00:00:00Z Developer <dev@example.com>
`;
      const planPath = join(testDir, 'latest-change.plan');
      writeFileSync(planPath, planContent);

      const latest = getLatestChange(planPath);
      
      expect(latest).toBe('comments_table');
    });

    it('should return empty string if no changes exist', () => {
      const planContent = `%syntax-version=1.0.0
%project=test-project
`;
      const planPath = join(testDir, 'no-changes.plan');
      writeFileSync(planPath, planContent);

      expect(getLatestChange(planPath)).toBe('');
    });
  });

  describe('resolveReference', () => {
    const plan: ExtendedPlanFile = {
      package: 'test-project',
      uri: '',
      changes: [
        { name: 'users_table', dependencies: [] },
        { name: 'posts_table', dependencies: [] },
        { name: 'comments_table', dependencies: [] }
      ],
      tags: [
        { name: 'v1.0.0', change: 'users_table' },
        { name: 'v2.0.0', change: 'posts_table' }
      ]
    };

    it('should resolve change references', () => {
      const result = resolveReference('posts_table', plan);
      expect(result.change).toBeDefined();
      expect(result.change).toBe('posts_table');
      expect(result.tag).toBeUndefined();
    });

    it('should resolve tag references', () => {
      const result = resolveReference('@v1.0.0', plan);
      expect(result.tag).toBeDefined();
      expect(result.tag).toBe('v1.0.0');
      expect(result.change).toBe('users_table');
    });

    it('should resolve HEAD reference', () => {
      const result = resolveReference('HEAD', plan);
      expect(result.change).toBeDefined();
      expect(result.change).toBe('comments_table');
    });

    it('should resolve ROOT reference', () => {
      const result = resolveReference('ROOT', plan);
      expect(result.change).toBeDefined();
      expect(result.change).toBe('users_table');
    });

    it('should resolve relative references', () => {
      const result = resolveReference('HEAD^', plan);
      expect(result.change).toBeDefined();
      expect(result.change).toBe('posts_table');
    });

    it('should resolve tag-relative references', () => {
      const result = resolveReference('@v2.0.0~', plan);
      expect(result.change).toBeDefined();
      expect(result.change).toBe('comments_table');
    });

    it('should return error for invalid references', () => {
      expect(resolveReference('nonexistent', plan).error).toBeDefined();
      expect(resolveReference('@nonexistent', plan).error).toBeDefined();
      expect(resolveReference('HEAD^10', plan).error).toBeDefined();
    });
  });
});
