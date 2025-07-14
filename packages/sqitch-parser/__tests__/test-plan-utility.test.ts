import { TestPlan } from '../test-utils';

describe('TestPlan Utility', () => {
  it('should load and analyze a valid plan file', () => {
    const testPlan = new TestPlan('plan-valid/valid-change-names.plan');
    
    // Basic assertions
    expect(testPlan.getContent()).toContain('%syntax-version=1.0.0');
    expect(testPlan.getLines().length).toBeGreaterThan(0);
    
    // Get insights
    const insights = testPlan.getInsights();
    console.log('Plan stats:', insights.stats);
    
    // Check pragmas
    const pragmas = testPlan.getPragmas();
    expect(pragmas.length).toBeGreaterThan(0);
    
    const syntaxPragma = pragmas.find(p => p.metadata?.pragmaName === 'syntax-version');
    expect(syntaxPragma).toBeDefined();
    expect(syntaxPragma?.metadata?.pragmaValue).toBe('1.0.0');
    
    // Check changes
    const changes = testPlan.getChanges();
    console.log(`Found ${changes.length} changes`);
    
    // Print first few changes for debugging
    changes.slice(0, 3).forEach(change => {
      console.log(`Change: ${change.metadata?.changeName} at line ${change.lineNumber}`);
    });
  });

  it('should detect errors in invalid plan files', () => {
    const testPlan = new TestPlan('plan-invalid/invalid-change-names.plan');
    
    expect(testPlan.isValid()).toBe(false);
    
    const errors = testPlan.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    
    console.log(`Found ${errors.length} errors:`);
    errors.slice(0, 5).forEach(err => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
    
    // Get lines with errors
    const errorLines = testPlan.getLinesWithErrors();
    expect(errorLines.length).toBeGreaterThan(0);
  });

  it('should provide line-by-line insights', () => {
    const testPlan = new TestPlan('plan-valid/symbolic-head-root.plan');
    
    // Get a specific line insight
    const line5 = testPlan.getLineInsight(5);
    if (line5) {
      console.log(`Line 5 type: ${line5.type}`);
      console.log(`Line 5 content: ${line5.content}`);
    }
    
    // Get all insights and group by type
    const insights = testPlan.getInsights();
    const typeGroups = insights.lineInsights.reduce((acc, insight) => {
      if (!acc[insight.type]) acc[insight.type] = [];
      acc[insight.type].push(insight);
      return acc;
    }, {} as Record<string, typeof insights.lineInsights>);
    
    console.log('Line types distribution:');
    Object.entries(typeGroups).forEach(([type, lines]) => {
      console.log(`  ${type}: ${lines.length} lines`);
    });
  });

  it('should handle tag parsing', () => {
    const testPlan = new TestPlan('plan-valid/valid-tag-names.plan');
    
    const tags = testPlan.getTags();
    console.log(`Found ${tags.length} tags`);
    
    tags.forEach(tag => {
      console.log(`Tag: ${tag.metadata?.tagName} at line ${tag.lineNumber}`);
    });
  });

  it('should provide accurate statistics', () => {
    const testPlan = new TestPlan('plan-valid/sha1-refs.plan');
    
    const stats = testPlan.getStats();
    console.log('File statistics:', stats);
    
    // Verify stats consistency
    const total = stats.pragmaCount + stats.changeCount + stats.tagCount + 
                  stats.commentCount + stats.emptyCount + stats.invalidCount;
    expect(total).toBe(stats.totalLines);
  });

  it('demonstrates the printInsights debug method', () => {
    const testPlan = new TestPlan('plan-invalid/bad-symbolic-refs.plan');
    
    // This will print a detailed analysis to console
    console.log('\n=== Debug output from printInsights() ===');
    testPlan.printInsights();
    console.log('=== End debug output ===\n');
  });
});