import { join } from 'path';
import {
  parsePlanFileWithValidation,
  resolveReference,
  ExtendedPlanFile
} from '../src/parser/plan-parser';

const fixturesDir = join(__dirname, 'fixtures');

describe('Plan Parser with Validation', () => {
  describe('Valid plan files', () => {
    it('should parse valid change names', () => {
      const planPath = join(fixturesDir, 'plan-valid', 'valid-change-names.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toBeDefined();
      expect(result.plan!.project).toBe('valid-changes');
      expect(result.plan!.changes).toHaveLength(18);
      
      // Check specific changes
      const changes = result.plan!.changes;
      expect(changes[0].name).toBe('foo');
      expect(changes[1].name).toBe('12');
      expect(changes[2].name).toBe('foo_bar');
      
      // Check dependencies
      expect(changes[10].name).toBe('users');
      expect(changes[10].dependencies).toEqual(['foo']);
      
      expect(changes[11].name).toBe('posts');
      expect(changes[11].dependencies).toEqual(['users', 'foo_bar']);
      
      // Check cross-project dependencies
      expect(changes[13].name).toBe('external_dep');
      expect(changes[13].dependencies).toEqual(['other_project:base_schema']);
    });

    it('should parse valid tag names', () => {
      const planPath = join(fixturesDir, 'plan-valid', 'valid-tag-names.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toBeDefined();
      expect(result.plan!.tags).toHaveLength(8);
      
      // Check specific tags
      const tags = result.plan!.tags;
      expect(tags[0]).toEqual({
        name: 'v1_0',
        change: 'schema',
        timestamp: '2024-01-01T00:00:03Z',
        planner: 'dev',
        email: 'dev@example.com',
        comment: 'Version tag with underscore'
      });
      
      expect(tags[1].name).toBe('rc1');
      expect(tags[1].change).toBe('tables');
      
      // Check tag references in dependencies
      const changes = result.plan!.changes;
      const indexesChange = changes.find(c => c.name === 'indexes');
      expect(indexesChange?.dependencies).toEqual(['tables@v1_0']);
      
      const proceduresChange = changes.find(c => c.name === 'procedures');
      expect(proceduresChange?.dependencies).toEqual(['@beta']);
    });

    it('should parse symbolic references', () => {
      const planPath = join(fixturesDir, 'plan-valid', 'symbolic-head-root.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toBeDefined();
      
      const changes = result.plan!.changes;
      expect(changes[4].dependencies).toEqual(['HEAD']);
      expect(changes[5].dependencies).toEqual(['ROOT']);
      expect(changes[6].dependencies).toEqual(['@HEAD']);
      expect(changes[7].dependencies).toEqual(['@ROOT']);
      
      // Cross-project symbolic
      expect(changes[8].dependencies).toEqual(['other:HEAD']);
      expect(changes[9].dependencies).toEqual(['other:@ROOT']);
    });

    it('should parse relative references', () => {
      const planPath = join(fixturesDir, 'plan-valid', 'relative-head-root.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toBeDefined();
      
      const changes = result.plan!.changes;
      
      // HEAD relative
      expect(changes[5].dependencies).toEqual(['@HEAD^']);
      expect(changes[6].dependencies).toEqual(['@HEAD^^']);
      expect(changes[7].dependencies).toEqual(['@HEAD^3']);
      
      // ROOT relative
      expect(changes[8].dependencies).toEqual(['@ROOT~']);
      expect(changes[9].dependencies).toEqual(['@ROOT~2']);
      
      // Tag relative
      expect(changes[10].dependencies).toEqual(['@beta^']);
      expect(changes[11].dependencies).toEqual(['@beta~2']);
      
      // Cross-project relative
      expect(changes[14].dependencies).toEqual(['project:foo^2']);
      expect(changes[15].dependencies).toEqual(['project:foo~3']);
    });

    it('should parse SHA1 references', () => {
      const planPath = join(fixturesDir, 'plan-valid', 'sha1-refs.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toBeDefined();
      
      const changes = result.plan!.changes;
      expect(changes[2].dependencies).toEqual(['40763784148fa190d75bad036730ef44d1c2eac6']);
      expect(changes[4].dependencies).toEqual(['project:40763784148fa190d75bad036730ef44d1c2eac6']);
      
      // Case insensitive SHA1
      expect(changes[7].dependencies).toEqual(['40763784148FA190D75BAD036730EF44D1C2EAC6']);
      expect(changes[8].dependencies).toEqual(['AbCdEf0123456789aBcDeF0123456789AbCdEf01']);
    });
  });

  describe('Invalid plan files', () => {
    it('should report errors for invalid change names', () => {
      const planPath = join(fixturesDir, 'plan-invalid', 'invalid-change-names.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check specific errors
      const errors = result.errors;
      expect(errors.some(e => e.message.includes('foo:bar'))).toBe(true);
      expect(errors.some(e => e.message.includes('foo^6'))).toBe(true);
      expect(errors.some(e => e.message.includes('+foo'))).toBe(true);
      expect(errors.some(e => e.message.includes('foo#bar'))).toBe(true);
    });

    it('should report errors for invalid tag names', () => {
      const planPath = join(fixturesDir, 'plan-invalid', 'invalid-tag-names.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check specific tag errors
      const errors = result.errors;
      expect(errors.some(e => e.message.includes('foo/bar'))).toBe(true);
      expect(errors.some(e => e.message.includes('foo:bar'))).toBe(true);
    });

    it('should report errors for bad symbolic references', () => {
      const planPath = join(fixturesDir, 'plan-invalid', 'bad-symbolic-refs.plan');
      const result = parsePlanFileWithValidation(planPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      
      const errors = result.errors;
      expect(errors.some(e => e.message.includes('change:with:colons'))).toBe(true);
      expect(errors.some(e => e.message.includes('@foo/bar'))).toBe(true);
      expect(errors.some(e => e.message.includes('@invalid@tag'))).toBe(true);
    });
  });
});

describe('Reference Resolution', () => {
  const createTestPlan = (): ExtendedPlanFile => ({
    project: 'test-project',
    uri: 'https://example.com',
    changes: [
      { name: 'first', dependencies: [] },
      { name: 'second', dependencies: ['first'] },
      { name: 'third', dependencies: ['second'] },
      { name: 'fourth', dependencies: ['third'] },
      { name: 'fifth', dependencies: ['fourth'] }
    ],
    tags: [
      { name: 'v1.0', change: 'second' },
      { name: 'beta', change: 'third' },
      { name: 'release', change: 'fifth' }
    ]
  });

  it('should resolve HEAD to last change', () => {
    const plan = createTestPlan();
    const result = resolveReference('HEAD', plan);
    expect(result).toEqual({ change: 'fifth' });
    
    const result2 = resolveReference('@HEAD', plan);
    expect(result2).toEqual({ change: 'fifth' });
  });

  it('should resolve ROOT to first change', () => {
    const plan = createTestPlan();
    const result = resolveReference('ROOT', plan);
    expect(result).toEqual({ change: 'first' });
    
    const result2 = resolveReference('@ROOT', plan);
    expect(result2).toEqual({ change: 'first' });
  });

  it('should resolve relative references from HEAD', () => {
    const plan = createTestPlan();
    
    expect(resolveReference('@HEAD^', plan)).toEqual({ change: 'fourth' });
    expect(resolveReference('@HEAD^^', plan)).toEqual({ change: 'third' });
    expect(resolveReference('@HEAD^3', plan)).toEqual({ change: 'second' });
  });

  it('should resolve relative references from ROOT', () => {
    const plan = createTestPlan();
    
    expect(resolveReference('@ROOT~', plan)).toEqual({ change: 'second' });
    expect(resolveReference('@ROOT~2', plan)).toEqual({ change: 'third' });
    expect(resolveReference('@ROOT~4', plan)).toEqual({ change: 'fifth' });
  });

  it('should resolve tag references', () => {
    const plan = createTestPlan();
    
    expect(resolveReference('@v1.0', plan)).toEqual({ tag: 'v1.0', change: 'second' });
    expect(resolveReference('@beta', plan)).toEqual({ tag: 'beta', change: 'third' });
  });

  it('should resolve relative references from tags', () => {
    const plan = createTestPlan();
    
    expect(resolveReference('@beta^', plan)).toEqual({ change: 'second' });
    expect(resolveReference('@beta~', plan)).toEqual({ change: 'fourth' });
    expect(resolveReference('@v1.0~2', plan)).toEqual({ change: 'fourth' });
  });

  it('should handle out of bounds errors', () => {
    const plan = createTestPlan();
    
    expect(resolveReference('@ROOT^', plan)).toEqual({ 
      error: 'Relative reference out of bounds: @ROOT^' 
    });
    expect(resolveReference('@HEAD~10', plan)).toEqual({ 
      error: 'Relative reference out of bounds: @HEAD~10' 
    });
  });

  it('should handle cross-project references', () => {
    const plan = createTestPlan();
    
    // Cross-project references are returned as-is
    expect(resolveReference('other:change', plan)).toEqual({ change: 'other:change' });
    expect(resolveReference('other:@tag', plan)).toEqual({ change: 'other:@tag' });
  });

  it('should handle SHA1 references', () => {
    const plan = createTestPlan();
    
    // SHA1 references are returned as-is (would need DB lookup)
    const sha1 = '40763784148fa190d75bad036730ef44d1c2eac6';
    expect(resolveReference(sha1, plan)).toEqual({ change: sha1 });
  });
});