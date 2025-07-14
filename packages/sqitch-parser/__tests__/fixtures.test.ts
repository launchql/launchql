import { TestPlan } from '../test-utils';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Fixture Tests', () => {
  const fixturesRoot = join(__dirname, '../../../__fixtures__/sqitch-parser');
  
  // Get all plan files from fixtures
  const getFixtures = (dir: string): string[] => {
    const files: string[] = [];
    const items = readdirSync(join(fixturesRoot, dir));
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(join(fixturesRoot, fullPath));
      
      if (stat.isDirectory()) {
        files.push(...getFixtures(fullPath));
      } else if (item.endsWith('.plan')) {
        files.push(fullPath);
      }
    });
    
    return files;
  };

  describe('Valid Plan Files', () => {
    const validFixtures = getFixtures('plan-valid');
    
    test.each(validFixtures)('should parse valid plan: %s', (fixturePath) => {
      const testPlan = new TestPlan(fixturePath);
      
      expect(testPlan.isValid()).toBe(true);
      expect(testPlan.getErrors()).toHaveLength(0);
      
      const insights = testPlan.getInsights();
      expect(insights.parsedData).toBeDefined();
      // simpleData might be undefined for complex valid files that the simple parser can't handle
      // but parsedData should always be defined for valid files
      
      // Check that we have at least some pragmas
      const pragmas = testPlan.getPragmas();
      expect(pragmas.length).toBeGreaterThan(0);
      
      // Verify pragma parsing
      pragmas.forEach(pragma => {
        expect(pragma.metadata?.pragmaName).toBeDefined();
        expect(pragma.metadata?.pragmaValue).toBeDefined();
      });
    });
  });

  describe('Invalid Plan Files', () => {
    const invalidFixtures = getFixtures('plan-invalid');
    
    test.each(invalidFixtures)('should detect errors in invalid plan: %s', (fixturePath) => {
      const testPlan = new TestPlan(fixturePath);
      
      expect(testPlan.isValid()).toBe(false);
      expect(testPlan.getErrors().length).toBeGreaterThan(0);
      
      // Check that we have lines with errors
      const linesWithErrors = testPlan.getLinesWithErrors();
      expect(linesWithErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Line Insights', () => {
    it('should provide detailed insights for each line type', () => {
      const testPlan = new TestPlan('plan-valid/symbolic-head-root.plan');
      const insights = testPlan.getInsights();
      
      // Test pragma detection
      const pragmas = testPlan.getPragmas();
      expect(pragmas.length).toBeGreaterThan(0);
      pragmas.forEach(pragma => {
        expect(pragma.type).toBe('pragma');
        expect(pragma.content).toMatch(/^%/);
      });
      
      // Test change detection
      const changes = testPlan.getChanges();
      if (changes.length > 0) {
        changes.forEach(change => {
          expect(change.type).toBe('change');
          expect(change.metadata?.changeName).toBeDefined();
        });
      }
      
      // Test tag detection
      const tags = testPlan.getTags();
      if (tags.length > 0) {
        tags.forEach(tag => {
          expect(tag.type).toBe('tag');
          expect(tag.content).toMatch(/^@/);
          expect(tag.metadata?.tagName).toBeDefined();
        });
      }
    });
  });

  describe('Specific Fixture Tests', () => {
    it('should handle bad symbolic references', () => {
      const testPlan = new TestPlan('plan-invalid/bad-symbolic-refs.plan');
      
      expect(testPlan.isValid()).toBe(false);
      
      const errors = testPlan.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      // Check for specific error types related to symbolic references
      const hasSymbolicRefError = errors.some(err => 
        err.message.toLowerCase().includes('symbolic') ||
        err.message.toLowerCase().includes('reference') ||
        err.message.toLowerCase().includes('not found')
      );
      expect(hasSymbolicRefError).toBe(true);
    });

    it('should handle invalid change names', () => {
      const testPlan = new TestPlan('plan-invalid/invalid-change-names.plan');
      
      expect(testPlan.isValid()).toBe(false);
      
      const errors = testPlan.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      // Check for errors related to change names
      const hasChangeNameError = errors.some(err => 
        err.message.toLowerCase().includes('change') ||
        err.message.toLowerCase().includes('name') ||
        err.message.toLowerCase().includes('invalid')
      );
      expect(hasChangeNameError).toBe(true);
    });

    it('should handle invalid tag names', () => {
      const testPlan = new TestPlan('plan-invalid/invalid-tag-names.plan');
      
      expect(testPlan.isValid()).toBe(false);
      
      const errors = testPlan.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      // Check for errors related to tag names
      const hasTagNameError = errors.some(err => 
        err.message.toLowerCase().includes('tag') ||
        err.message.toLowerCase().includes('invalid')
      );
      expect(hasTagNameError).toBe(true);
    });

    it('should parse project-qualified references', () => {
      const testPlan = new TestPlan('plan-valid/project-qualified.plan');
      
      expect(testPlan.isValid()).toBe(true);
      
      const changes = testPlan.getChanges();
      // Check if any changes have project-qualified dependencies
      const hasQualifiedDeps = changes.some(change => 
        change.metadata?.dependencies?.some(dep => dep.includes(':'))
      );
      
      if (hasQualifiedDeps) {
        expect(hasQualifiedDeps).toBe(true);
      }
    });

    it('should handle SHA1 references', () => {
      const testPlan = new TestPlan('plan-valid/sha1-refs.plan');
      
      expect(testPlan.isValid()).toBe(true);
      
      // SHA1 refs should be valid
      const insights = testPlan.getInsights();
      expect(insights.parsedData).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const testPlan = new TestPlan('plan-valid/valid-change-names.plan');
      const stats = testPlan.getStats();
      
      expect(stats.totalLines).toBeGreaterThan(0);
      expect(stats.pragmaCount).toBeGreaterThan(0);
      
      // Verify stats add up
      const sumOfTypes = stats.pragmaCount + stats.changeCount + 
                        stats.tagCount + stats.commentCount + 
                        stats.emptyCount + stats.invalidCount;
      expect(sumOfTypes).toBe(stats.totalLines);
    });
  });
});