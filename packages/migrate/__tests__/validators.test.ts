import {
  isValidChangeName,
  isValidTagName,
  parseReference,
  isValidDependency
} from '../src/parser/validators';

describe('Change Name Validation', () => {
  describe('Valid change names', () => {
    const validNames = [
      'foo',
      '12',
      'foo_bar',
      'v1.2-1',
      'beta2',
      '_hidden',
      'test_',
      'a-b-c',
      'CamelCase',
      'UPPERCASE',
      'x',
      '___',
      'a1b2c3'
    ];

    validNames.forEach(name => {
      it(`should accept "${name}"`, () => {
        expect(isValidChangeName(name)).toBe(true);
      });
    });
  });

  describe('Invalid change names', () => {
    const invalidNames = [
      ['@foo', 'contains @'],
      ['foo:bar', 'contains :'],
      ['foo\\bar', 'contains \\'],
      ['foo#bar', 'contains #'],
      ['foo^6', 'ends with ^N'],
      ['bar~9', 'ends with ~N'],
      ['baz/3', 'ends with /N'],
      ['qux=7', 'ends with =N'],
      ['test%42', 'ends with %N'],
      ['+foo', 'starts with punctuation +'],
      ['-bar', 'starts with punctuation -'],
      ['.baz', 'starts with punctuation .'],
      ['!qux', 'starts with punctuation !'],
      ['foo+', 'ends with punctuation +'],
      ['bar-', 'ends with punctuation -'],
      ['baz.', 'ends with punctuation .'],
      ['qux!', 'ends with punctuation !'],
      ['foo bar', 'contains space'],
      ['tab\ttest', 'contains tab'],
      ['new\nline', 'contains newline'],
      ['', 'empty string'],
      ['%hi', 'starts with %']
    ];

    invalidNames.forEach(([name, reason]) => {
      it(`should reject "${name}" (${reason})`, () => {
        expect(isValidChangeName(name)).toBe(false);
      });
    });
  });
});

describe('Tag Name Validation', () => {
  describe('Valid tag names', () => {
    const validTags = [
      'v1_0',
      'rc1',
      'prod-tag',
      'beta',
      '_internal',
      'RELEASE',
      'v2.0.0'
    ];

    validTags.forEach(name => {
      it(`should accept "${name}"`, () => {
        expect(isValidTagName(name)).toBe(true);
      });
    });
  });

  describe('Invalid tag names', () => {
    it('should reject tags with forward slash', () => {
      expect(isValidTagName('foo/bar')).toBe(false);
      expect(isValidTagName('v1/2')).toBe(false);
    });

    it('should reject tags with same invalid patterns as changes', () => {
      expect(isValidTagName('foo:bar')).toBe(false);
      expect(isValidTagName('foo@bar')).toBe(false);
      expect(isValidTagName('foo#bar')).toBe(false);
      expect(isValidTagName('foo\\bar')).toBe(false);
    });
  });
});

describe('Reference Parsing', () => {
  describe('Basic forms', () => {
    it('should parse plain change name', () => {
      const ref = parseReference('users_table');
      expect(ref).toEqual({ change: 'users_table' });
    });

    it('should parse tag reference', () => {
      const ref = parseReference('@v1.0');
      expect(ref).toEqual({ tag: 'v1.0' });
    });

    it('should parse change@tag format', () => {
      const ref = parseReference('users_table@v1.0');
      expect(ref).toEqual({ change: 'users_table', tag: 'v1.0' });
    });
  });

  describe('SHA1 forms', () => {
    it('should parse SHA1 hash', () => {
      const ref = parseReference('40763784148fa190d75bad036730ef44d1c2eac6');
      expect(ref).toEqual({ sha1: '40763784148fa190d75bad036730ef44d1c2eac6' });
    });

    it('should parse project-qualified SHA1', () => {
      const ref = parseReference('project:40763784148fa190d75bad036730ef44d1c2eac6');
      expect(ref).toEqual({ 
        project: 'project',
        sha1: '40763784148fa190d75bad036730ef44d1c2eac6' 
      });
    });

    it('should handle case-insensitive SHA1', () => {
      const ref = parseReference('40763784148FA190D75BAD036730EF44D1C2EAC6');
      expect(ref).toEqual({ sha1: '40763784148FA190D75BAD036730EF44D1C2EAC6' });
    });
  });

  describe('Project-qualified forms', () => {
    it('should parse project:change', () => {
      const ref = parseReference('otherproj:users_table');
      expect(ref).toEqual({ project: 'otherproj', change: 'users_table' });
    });

    it('should parse project:@tag', () => {
      const ref = parseReference('otherproj:@v1.2');
      expect(ref).toEqual({ project: 'otherproj', tag: 'v1.2' });
    });

    it('should parse project:change@tag', () => {
      const ref = parseReference('otherproj:users_table@v1.2');
      expect(ref).toEqual({ 
        project: 'otherproj', 
        change: 'users_table',
        tag: 'v1.2'
      });
    });
  });

  describe('Symbolic forms', () => {
    it('should parse HEAD', () => {
      expect(parseReference('HEAD')).toEqual({ symbolic: 'HEAD' });
      expect(parseReference('@HEAD')).toEqual({ symbolic: 'HEAD' });
    });

    it('should parse ROOT', () => {
      expect(parseReference('ROOT')).toEqual({ symbolic: 'ROOT' });
      expect(parseReference('@ROOT')).toEqual({ symbolic: 'ROOT' });
    });
  });

  describe('Relative forms', () => {
    it('should parse HEAD^ variations', () => {
      expect(parseReference('@HEAD^')).toEqual({
        relative: { base: '@HEAD', direction: '^', count: 1 }
      });
      expect(parseReference('@HEAD^^')).toEqual({
        relative: { base: '@HEAD', direction: '^', count: 2 }
      });
      expect(parseReference('@HEAD^3')).toEqual({
        relative: { base: '@HEAD', direction: '^', count: 3 }
      });
    });

    it('should parse ROOT~ variations', () => {
      expect(parseReference('@ROOT~')).toEqual({
        relative: { base: '@ROOT', direction: '~', count: 1 }
      });
      expect(parseReference('@ROOT~2')).toEqual({
        relative: { base: '@ROOT', direction: '~', count: 2 }
      });
    });

    it('should parse tag relative references', () => {
      expect(parseReference('@beta~2')).toEqual({
        relative: { base: '@beta', direction: '~', count: 2 }
      });
      expect(parseReference('@v1.0^')).toEqual({
        relative: { base: '@v1.0', direction: '^', count: 1 }
      });
    });

    it('should parse project-qualified relative references', () => {
      expect(parseReference('project:foo^2')).toEqual({
        project: 'project',
        relative: { base: 'foo', direction: '^', count: 2 }
      });
      expect(parseReference('project:foo~3')).toEqual({
        project: 'project',
        relative: { base: 'foo', direction: '~', count: 3 }
      });
    });
  });

  describe('Invalid references', () => {
    it('should return null for invalid references', () => {
      expect(parseReference('foo:bar:baz')).toBeNull(); // multiple colons
      expect(parseReference('@foo/bar')).toBeNull(); // / in tag name
      expect(parseReference('change with spaces')).toBeNull();
      expect(parseReference('')).toBeNull();
      expect(parseReference('change#name')).toBeNull(); // # in name
      expect(parseReference('@tag#name')).toBeNull(); // # in tag
    });
  });
});

describe('Dependency Validation', () => {
  it('should accept all valid reference forms', () => {
    const validDeps = [
      'simple_change',
      '@tag',
      'change@tag',
      'project:change',
      'project:@tag',
      '40763784148fa190d75bad036730ef44d1c2eac6',
      'HEAD',
      '@ROOT',
      '@HEAD^',
      '@beta~2',
      'project:change^3'
    ];

    validDeps.forEach(dep => {
      expect(isValidDependency(dep)).toBe(true);
    });
  });

  it('should reject invalid references', () => {
    const invalidDeps = [
      'foo:bar:baz', // multiple colons
      '@foo/bar', // / in tag
      'change with spaces',
      '',
      'change@', // empty tag
      'change@tag@extra', // Multiple @ symbols
      'change#name', // # in name
      '@tag#name', // # in tag
      'proj:@tag/name', // / in tag with project
    ];

    invalidDeps.forEach(dep => {
      expect(isValidDependency(dep)).toBe(false);
    });
  });
});