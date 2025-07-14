# TestPlan Utility

The `TestPlan` class is a testing utility for the sqitch-parser package that loads plan file fixtures and provides detailed insights for testing.

## Usage

```typescript
import { TestPlan } from '@launchql/sqitch-parser/test-utils';

// Load a fixture file
const testPlan = new TestPlan('plan-valid/simple.plan');

// Check if the plan is valid
if (testPlan.isValid()) {
  console.log('Plan is valid!');
} else {
  console.log('Errors:', testPlan.getErrors());
}
```

## API Reference

### Constructor

```typescript
new TestPlan(fixturePath: string)
```

Creates a new TestPlan instance by loading a fixture file from `__fixtures__/sqitch-parser/`.

- `fixturePath`: Path relative to `__fixtures__/sqitch-parser/` (e.g., `'plan-valid/simple.plan'`)

### Methods

#### Content Access

- `getContent(): string` - Returns the raw content of the plan file
- `getLines(): string[]` - Returns an array of all lines in the file

#### Validation

- `isValid(): boolean` - Returns true if the plan file is valid
- `getErrors(): ParseError[]` - Returns array of parsing errors

#### Insights

- `getInsights(): PlanInsights` - Returns comprehensive analysis of the plan file
- `getLineInsight(lineNumber: number): LineInsight | undefined` - Get insights for a specific line
- `getStats()` - Returns statistics about the plan file

#### Line Type Filters

- `getChanges(): LineInsight[]` - Returns all change lines
- `getTags(): LineInsight[]` - Returns all tag lines
- `getPragmas(): LineInsight[]` - Returns all pragma lines
- `getInvalidLines(): LineInsight[]` - Returns all invalid lines
- `getLinesWithErrors(): LineInsight[]` - Returns lines that have associated errors

#### Debugging

- `printInsights(): void` - Prints detailed analysis to console

## Types

### LineInsight

```typescript
interface LineInsight {
  lineNumber: number;
  content: string;
  type: 'pragma' | 'change' | 'tag' | 'comment' | 'empty' | 'invalid';
  errors?: ParseError[];
  metadata?: {
    pragmaName?: string;
    pragmaValue?: string;
    changeName?: string;
    dependencies?: string[];
    tagName?: string;
    timestamp?: string;
    planner?: string;
    email?: string;
    comment?: string;
  };
}
```

### PlanInsights

```typescript
interface PlanInsights {
  isValid: boolean;
  errors: ParseError[];
  lineInsights: LineInsight[];
  parsedData?: ExtendedPlanFile;
  simpleData?: PlanFile;
  stats: {
    totalLines: number;
    pragmaCount: number;
    changeCount: number;
    tagCount: number;
    commentCount: number;
    emptyCount: number;
    invalidCount: number;
  };
}
```

## Examples

### Testing Valid Plan Files

```typescript
describe('Valid Plan Files', () => {
  it('should parse a valid plan', () => {
    const testPlan = new TestPlan('plan-valid/simple.plan');
    
    expect(testPlan.isValid()).toBe(true);
    expect(testPlan.getErrors()).toHaveLength(0);
    
    // Check pragmas
    const pragmas = testPlan.getPragmas();
    expect(pragmas.length).toBeGreaterThan(0);
    
    // Check changes
    const changes = testPlan.getChanges();
    changes.forEach(change => {
      expect(change.metadata?.changeName).toBeDefined();
    });
  });
});
```

### Testing Invalid Plan Files

```typescript
describe('Invalid Plan Files', () => {
  it('should detect errors', () => {
    const testPlan = new TestPlan('plan-invalid/bad-symbolic-refs.plan');
    
    expect(testPlan.isValid()).toBe(false);
    
    const errors = testPlan.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    
    // Check specific error types
    const hasSymbolicRefError = errors.some(err => 
      err.message.includes('Invalid dependency reference')
    );
    expect(hasSymbolicRefError).toBe(true);
  });
});
```

### Line-by-Line Analysis

```typescript
it('should provide line insights', () => {
  const testPlan = new TestPlan('plan-valid/with-tags.plan');
  
  // Get insight for a specific line
  const line5 = testPlan.getLineInsight(5);
  console.log(`Line 5 is a ${line5?.type}: ${line5?.content}`);
  
  // Get all tags
  const tags = testPlan.getTags();
  tags.forEach(tag => {
    console.log(`Tag ${tag.metadata?.tagName} at line ${tag.lineNumber}`);
  });
});
```

### Debugging

```typescript
// Print detailed analysis for debugging
const testPlan = new TestPlan('plan-invalid/complex-errors.plan');
testPlan.printInsights();
```

## Available Fixtures

The utility loads fixtures from `__fixtures__/sqitch-parser/`:

### Valid Plans (`plan-valid/`)
- `project-qualified.plan` - Plans with project-qualified references
- `relative-head-root.plan` - Plans with relative references from HEAD/ROOT
- `sha1-refs.plan` - Plans with SHA1 references
- `symbolic-head-root.plan` - Plans with symbolic references
- `valid-change-names.plan` - Plans with various valid change name formats
- `valid-tag-names.plan` - Plans with various valid tag name formats

### Invalid Plans (`plan-invalid/`)
- `bad-symbolic-refs.plan` - Invalid symbolic references
- `invalid-change-names.plan` - Invalid change name formats
- `invalid-tag-names.plan` - Invalid tag name formats