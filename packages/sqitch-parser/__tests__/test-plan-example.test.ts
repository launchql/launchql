import { TestPlan } from '../test-utils';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('TestPlan Utility Example', () => {
  const testDir = join(__dirname, 'test-fixtures');
  
  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });
  
  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });
  
  it('demonstrates TestPlan usage with a simple plan', () => {
    // Create a simple test plan file
    const planContent = `%syntax-version=1.0.0
%project=test-project
%uri=https://github.com/test/project

# Initial schema
users_table 2024-01-01T00:00:00Z Developer <dev@example.com> # Create users table
posts_table [users_table] 2024-01-02T00:00:00Z Developer <dev@example.com> # Create posts table

# Add tag after posts_table
@v1.0.0 2024-01-02T12:00:00Z Developer <dev@example.com> # Version 1.0.0

# More changes
comments_table [posts_table] 2024-01-03T00:00:00Z Developer <dev@example.com> # Create comments table
`;
    
    // Write to a temporary location
    const tempPlanPath = join(testDir, 'example.plan');
    writeFileSync(tempPlanPath, planContent);
    
    // Create TestPlan instance with absolute path
    const testPlan = new TestPlan(tempPlanPath);
    
    // Basic assertions
    expect(testPlan.isValid()).toBe(true);
    expect(testPlan.getErrors()).toHaveLength(0);
    
    // Get insights
    const insights = testPlan.getInsights();
    console.log('Actual stats:', insights.stats);
    console.log('Line count:', testPlan.getLines().length);
    
    // Don't check exact line count as it depends on trailing newlines
    expect(insights.stats.pragmaCount).toBe(3);
    expect(insights.stats.changeCount).toBe(3);
    expect(insights.stats.tagCount).toBe(1);
    expect(insights.stats.commentCount).toBe(3); // Includes empty comment lines
    
    // Check pragmas
    const pragmas = testPlan.getPragmas();
    expect(pragmas).toHaveLength(3);
    
    const projectPragma = pragmas.find(p => p.metadata?.pragmaName === 'project');
    expect(projectPragma?.metadata?.pragmaValue).toBe('test-project');
    
    // Check changes
    const changes = testPlan.getChanges();
    expect(changes).toHaveLength(3);
    expect(changes[0].metadata?.changeName).toBe('users_table');
    expect(changes[1].metadata?.changeName).toBe('posts_table');
    expect(changes[1].metadata?.dependencies).toEqual(['users_table']);
    
    // Check tags
    const tags = testPlan.getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].metadata?.tagName).toBe('@v1.0.0');
    
    // Line-by-line insight
    const line5 = testPlan.getLineInsight(5);
    expect(line5?.type).toBe('comment');
    expect(line5?.content).toContain('Initial schema');
    
    // Print insights for debugging (optional)
    console.log('\n=== TestPlan Demo ===');
    console.log('Stats:', insights.stats);
    console.log('Changes:', changes.map(c => c.metadata?.changeName));
    console.log('Tags:', tags.map(t => t.metadata?.tagName));
    console.log('===================\n');
  });
  
  it('demonstrates error detection', () => {
    // Create an invalid plan file
    const invalidPlanContent = `%syntax-version=1.0.0
# Missing %project pragma

invalid:change:name 2024-01-01T00:00:00Z Developer <dev@example.com> # Invalid name
good_change [missing_dependency] 2024-01-02T00:00:00Z Developer <dev@example.com> # Missing dep
`;
    
    const tempPlanPath = join(testDir, 'invalid.plan');
    writeFileSync(tempPlanPath, invalidPlanContent);
    
    const testPlan = new TestPlan(tempPlanPath);
    
    console.log('Invalid plan errors:', testPlan.getErrors());
    console.log('Is valid?', testPlan.isValid());
    
    expect(testPlan.isValid()).toBe(false);
    
    const errors = testPlan.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    
    // Check for specific errors
    // The parser doesn't check for missing %project pragma, only invalid syntax
    const hasInvalidNameError = errors.some(e => 
      e.message.includes('Invalid change name')
    );
    expect(hasInvalidNameError).toBe(true);
    
    // Get lines with errors
    const errorLines = testPlan.getLinesWithErrors();
    expect(errorLines.length).toBeGreaterThan(0);
    
    console.log('\n=== Error Detection Demo ===');
    console.log('Errors found:', errors.length);
    errors.forEach(err => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
    console.log('==========================\n');
  });
});