import {
  isValidChangeName,
  isValidDependency,
  isValidTagName,
  parseReference
} from '../../../src/files';

describe('Validators', () => {
  describe('isValidChangeName', () => {
    it('should accept valid change names', () => {
      expect(isValidChangeName('users_table')).toBe(true);
      expect(isValidChangeName('posts-table')).toBe(true);
      expect(isValidChangeName('table123')).toBe(true);
      expect(isValidChangeName('a')).toBe(true);
      expect(isValidChangeName('users_posts_comments')).toBe(true);
    });

    it('should reject invalid change names', () => {
      expect(isValidChangeName('')).toBe(false);
      expect(isValidChangeName('@tag')).toBe(false);
      expect(isValidChangeName('users@table')).toBe(false);
      expect(isValidChangeName('users table')).toBe(false);
      expect(isValidChangeName('users:table')).toBe(false);
      expect(isValidChangeName('!users')).toBe(false);
      expect(isValidChangeName('users#table')).toBe(false);
      expect(isValidChangeName('users\\table')).toBe(false);
    });
  });

  describe('isValidTagName', () => {
    it('should accept valid tag names', () => {
      expect(isValidTagName('v1.0.0')).toBe(true);
      expect(isValidTagName('release-2024')).toBe(true);
      expect(isValidTagName('beta_1')).toBe(true);
      expect(isValidTagName('1.0')).toBe(true);
    });

    it('should reject invalid tag names', () => {
      expect(isValidTagName('')).toBe(false);
      expect(isValidTagName('@v1.0.0')).toBe(false);
      expect(isValidTagName('tag with spaces')).toBe(false);
      expect(isValidTagName('tag/with/slash')).toBe(false);
      expect(isValidTagName('tag:with:colon')).toBe(false);
    });
  });

  describe('isValidDependency', () => {
    it('should accept valid dependencies', () => {
      // Plain change names
      expect(isValidDependency('users_table')).toBe(true);
      
      // Tag references
      expect(isValidDependency('@v1.0.0')).toBe(true);
      
      // Change at tag
      expect(isValidDependency('users_table@v1.0.0')).toBe(true);
      
      // SHA1 references
      expect(isValidDependency('abc1234567890123456789012345678901234567')).toBe(true);
      
      // Project-qualified
      expect(isValidDependency('other_project:users_table')).toBe(true);
      expect(isValidDependency('other_project:@v1.0.0')).toBe(true);
      
      // Symbolic references
      expect(isValidDependency('HEAD')).toBe(true);
      expect(isValidDependency('ROOT')).toBe(true);
      expect(isValidDependency('@HEAD')).toBe(true);
      expect(isValidDependency('@ROOT')).toBe(true);
      
      // Relative references
      expect(isValidDependency('HEAD^')).toBe(true);
      expect(isValidDependency('HEAD^^')).toBe(true);
      expect(isValidDependency('HEAD^3')).toBe(true);
      expect(isValidDependency('@v1.0.0~')).toBe(true);
      expect(isValidDependency('@v1.0.0~2')).toBe(true);
    });

    it('should reject invalid dependencies', () => {
      expect(isValidDependency('')).toBe(false);
      expect(isValidDependency('invalid@char@here')).toBe(false);
      expect(isValidDependency('spaces not allowed')).toBe(false);
      expect(isValidDependency('project::double:colon')).toBe(false);
      expect(isValidDependency('!@invalid@tag')).toBe(false);
    });
  });

  describe('parseReference', () => {
    it('should parse plain change names', () => {
      const ref = parseReference('users_table');
      expect(ref).toMatchObject({
        change: 'users_table'
      });
    });

    it('should parse tag references', () => {
      const ref = parseReference('@v1.0.0');
      expect(ref).toMatchObject({
        tag: 'v1.0.0'
      });
    });

    it('should parse change at tag', () => {
      const ref = parseReference('users_table@v1.0.0');
      expect(ref).toMatchObject({
        change: 'users_table',
        tag: 'v1.0.0'
      });
    });

    it('should parse SHA1 references', () => {
      const sha1 = 'abc1234567890123456789012345678901234567';
      const ref = parseReference(sha1);
      expect(ref).toMatchObject({
        sha1: sha1
      });
    });

    it('should parse project-qualified references', () => {
      const ref = parseReference('other_project:users_table');
      expect(ref).toMatchObject({
        package: 'other_project',
        change: 'users_table'
      });
    });

    it('should parse symbolic references', () => {
      expect(parseReference('HEAD')).toMatchObject({ symbolic: 'HEAD' });
      expect(parseReference('ROOT')).toMatchObject({ symbolic: 'ROOT' });
      expect(parseReference('@HEAD')).toMatchObject({ symbolic: 'HEAD' });
      expect(parseReference('@ROOT')).toMatchObject({ symbolic: 'ROOT' });
    });

    it('should parse relative references', () => {
      expect(parseReference('HEAD^')).toMatchObject({ 
        relative: { 
          base: 'HEAD', 
          direction: '^', 
          count: 1 
        } 
      });
      expect(parseReference('HEAD^^')).toMatchObject({ 
        relative: { 
          base: 'HEAD', 
          direction: '^', 
          count: 2 
        } 
      });
      expect(parseReference('HEAD^3')).toMatchObject({ 
        relative: { 
          base: 'HEAD', 
          direction: '^', 
          count: 3 
        } 
      });
      expect(parseReference('@v1.0.0~')).toMatchObject({ 
        relative: { 
          base: '@v1.0.0', 
          direction: '~', 
          count: 1 
        } 
      });
      expect(parseReference('@v1.0.0~2')).toMatchObject({ 
        relative: { 
          base: '@v1.0.0', 
          direction: '~', 
          count: 2 
        } 
      });
    });

    it('should parse conflict references', () => {
      const ref = parseReference('!users_table');
      expect(ref).toBeNull(); // Conflicts are not parsed by parseReference
    });

    it('should return null for invalid references', () => {
      expect(parseReference('')).toBeNull();
      expect(parseReference('invalid@char@here')).toBeNull();
      expect(parseReference('spaces not allowed')).toBeNull();
    });
  });
});
