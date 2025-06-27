import { parsePlanFile, getChangeNamesFromPlan, getChangesInOrder } from '../src/parser/plan';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Plan Parser', () => {
  const testPlanPath = join(__dirname, 'test.plan');
  
  afterEach(() => {
    try {
      unlinkSync(testPlanPath);
    } catch (e) {
      // Ignore if file doesn't exist
    }
  });
  
  it('should parse a simple plan file', () => {
    const planContent = `%syntax-version=1.0.0
%project=test-project
%uri=test-uri

schema 2024-01-01T00:00:00Z developer <dev@example.com> # Create schema
users [schema] 2024-01-02T00:00:00Z developer <dev@example.com> # Create users table
posts [users] 2024-01-03T00:00:00Z developer <dev@example.com> # Create posts table
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const plan = parsePlanFile(testPlanPath);
    
    expect(plan.project).toBe('test-project');
    expect(plan.uri).toBe('test-uri');
    expect(plan.changes).toHaveLength(3);
    
    expect(plan.changes[0]).toEqual({
      name: 'schema',
      dependencies: [],
      timestamp: '2024-01-01T00:00:00Z',
      planner: 'developer',
      email: 'dev@example.com',
      comment: 'Create schema'
    });
    
    expect(plan.changes[1]).toEqual({
      name: 'users',
      dependencies: ['schema'],
      timestamp: '2024-01-02T00:00:00Z',
      planner: 'developer',
      email: 'dev@example.com',
      comment: 'Create users table'
    });
    
    expect(plan.changes[2]).toEqual({
      name: 'posts',
      dependencies: ['users'],
      timestamp: '2024-01-03T00:00:00Z',
      planner: 'developer',
      email: 'dev@example.com',
      comment: 'Create posts table'
    });
  });
  
  it('should parse changes with multiple dependencies', () => {
    const planContent = `%project=test
change1 2024-01-01T00:00:00Z dev <dev@test.com> # First change
change2 [change1] 2024-01-02T00:00:00Z dev <dev@test.com> # Second change
change3 [change1 change2] 2024-01-03T00:00:00Z dev <dev@test.com> # Third change
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const plan = parsePlanFile(testPlanPath);
    
    expect(plan.changes[2].dependencies).toEqual(['change1', 'change2']);
  });
  
  it('should parse changes with project prefixes in dependencies', () => {
    const planContent = `%project=myproject
procedures/verify_constraint [pg-utilities:procedures/tg_update_timestamps] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/verify_constraint
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const plan = parsePlanFile(testPlanPath);
    
    expect(plan.changes[0]).toEqual({
      name: 'procedures/verify_constraint',
      dependencies: ['pg-utilities:procedures/tg_update_timestamps'],
      timestamp: '2017-08-11T08:11:51Z',
      planner: 'skitch',
      email: 'skitch@5b0c196eeb62',
      comment: 'add procedures/verify_constraint'
    });
  });
  
  it('should get change names from plan', () => {
    const planContent = `%project=test
change1 2024-01-01T00:00:00Z dev <dev@test.com> # First
change2 2024-01-02T00:00:00Z dev <dev@test.com> # Second
change3 2024-01-03T00:00:00Z dev <dev@test.com> # Third
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const names = getChangeNamesFromPlan(testPlanPath);
    
    expect(names).toEqual(['change1', 'change2', 'change3']);
  });
  
  it('should get changes in reverse order for revert', () => {
    const planContent = `%project=test
change1 2024-01-01T00:00:00Z dev <dev@test.com> # First
change2 2024-01-02T00:00:00Z dev <dev@test.com> # Second
change3 2024-01-03T00:00:00Z dev <dev@test.com> # Third
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const forwardChanges = getChangesInOrder(testPlanPath, false);
    const reverseChanges = getChangesInOrder(testPlanPath, true);
    
    expect(forwardChanges.map(c => c.name)).toEqual(['change1', 'change2', 'change3']);
    expect(reverseChanges.map(c => c.name)).toEqual(['change3', 'change2', 'change1']);
  });
  
  it('should skip tags and empty lines', () => {
    const planContent = `%project=test

change1 2024-01-01T00:00:00Z dev <dev@test.com> # First

@v1.0.0 2024-01-01T00:00:00Z

change2 2024-01-02T00:00:00Z dev <dev@test.com> # Second
`;
    
    writeFileSync(testPlanPath, planContent);
    
    const plan = parsePlanFile(testPlanPath);
    
    expect(plan.changes).toHaveLength(2);
    expect(plan.changes.map(c => c.name)).toEqual(['change1', 'change2']);
  });
});