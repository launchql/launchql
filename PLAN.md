# LaunchQL Extension Name Logic Investigation & Improvement Plan

## 🔍 Current Issue Analysis

### Problem 1: `extension === name ? toChange : undefined` Logic
Found in `/packages/core/src/core/class/launchql.ts` at lines 752, 851, and 938:

```typescript
const result = await client.deploy({
  modulePath,
  toChange: extension === name ? toChange : undefined,  // ← Problematic logic
  useTransaction: opts.deployment.useTx,
  logOnly: opts.deployment.logOnly
});
```

**Issues:**
- Only passes `toChange` to target module, `undefined` to dependencies
- Dependencies process ALL changes regardless of `toChange` parameter
- Naming conflicts when multiple modules have same change names
- No support for project-prefixed change names like `project-a:specific_change`

### Problem 2: Ambiguous LaunchQLProject Method Parameters

Current method signatures:
```typescript
async verify(opts: LaunchQLOptions, name?: string, toChange?: string, recursive: boolean = true)
async revert(opts: LaunchQLOptions, name?: string, toChange?: string, recursive: boolean = true)  
async deploy(opts: LaunchQLOptions, name?: string, toChange?: string, recursive: boolean = true)
```

**Ambiguity Issues:**
- `name` parameter: What does this represent? Project name? Module name?
- `toChange` parameter: Change name within a project?
- Redundancy: Why have both when we could unify them?
- Confusion: When deploying `my-third` up to `my-first:some_change`, are we really deploying `my-third`?

## 💡 Proposed Solutions

### Solution 1: Unified Target Parameter
Replace `name` and `toChange` with a single `target` parameter that supports:

```typescript
// Deploy entire project
target: 'my-project'

// Deploy project up to specific change
target: 'my-project:some_change'

// Deploy up to change in different project (cross-project dependency)
target: 'other-project:specific_change'
```

### Solution 2: Enhanced Logic for Project Prefix Detection
```typescript
function parseTarget(target: string): { project: string | null, change: string | null } {
  const colonIndex = target.indexOf(':');
  
  if (colonIndex > 0) {
    return {
      project: target.substring(0, colonIndex),
      change: target.substring(colonIndex + 1)
    };
  } else {
    // Determine if this is a project name or change name
    // Could use heuristics or explicit project registry
    return {
      project: target, // Assume project name if no colon
      change: null
    };
  }
}
```

### Solution 3: Disambiguation Strategy
To resolve ambiguity between project names and change names:

1. **Convention-based**: Use naming conventions (e.g., projects use kebab-case, changes use snake_case)
2. **Registry-based**: Maintain a registry of known projects
3. **Explicit syntax**: Always require `project:change` for changes, bare names are projects
4. **Context-aware**: Use file system context to determine if target exists as project

## 🧪 Research Needed

### Investigation Tasks
1. **Analyze current usage patterns** in existing codebase
2. **Examine fixture files** to understand naming conventions
3. **Review LaunchQLProject class** method implementations
4. **Study LaunchQLMigrate client** parameter handling
5. **Test backward compatibility** requirements

### Key Questions to Answer
- How are `name` and `toChange` currently used in practice?
- What naming conventions exist for projects vs changes?
- How do cross-project dependencies currently work?
- What would break with a unified parameter approach?
- How can we maintain backward compatibility?

## 📋 Implementation Plan

### Phase 1: Deep Analysis
- [ ] Analyze all current usages of LaunchQLProject methods
- [ ] Document current parameter semantics
- [ ] Identify naming patterns in fixtures and tests
- [ ] Map out cross-project dependency scenarios

### Phase 2: Design Unified API
- [ ] Design new unified parameter structure
- [ ] Create disambiguation logic
- [ ] Plan backward compatibility strategy
- [ ] Design migration path for existing code

### Phase 3: Implementation
- [ ] Implement new parameter parsing logic
- [ ] Update LaunchQLProject methods
- [ ] Update LaunchQLMigrate client calls
- [ ] Add comprehensive test coverage

### Phase 4: Testing & Validation
- [ ] Test all existing scenarios
- [ ] Test new unified parameter scenarios
- [ ] Validate cross-project dependencies
- [ ] Performance testing

## 🎯 Success Criteria

1. **Clarity**: Single parameter that clearly expresses intent
2. **Flexibility**: Support both project-only and project:change targets
3. **Backward Compatibility**: Existing code continues to work
4. **Predictability**: Unambiguous behavior in all scenarios
5. **Simplicity**: Easier to understand and use than current API

## 📁 Files to Investigate

- `/packages/core/src/core/class/launchql.ts` - LaunchQLProject class
- `/packages/core/src/migrate/client.ts` - LaunchQLMigrate client
- `/__fixtures__/migrate/cross-project/` - Cross-project examples
- `/packages/core/__tests__/migration/` - Existing test patterns

## 🚧 Risks & Considerations

- **Breaking Changes**: API changes may break existing code
- **Complexity**: Disambiguation logic could become complex
- **Performance**: Additional parsing overhead
- **Edge Cases**: Unusual naming patterns may cause issues

---

*This plan will be updated as research progresses and new insights are discovered.*
