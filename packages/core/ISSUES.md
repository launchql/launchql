# LaunchQL Core - Issues and Test Cases


## Current Priority


read packages/core/__tests__/projects/forked-deployment-scenarios.test.ts as an example

you'll see some commented out code:

// await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'], 'my-first:@v1.0.0');

// expect(await db.exists('schema', 'mythirdapp')).toBe(false);
// expect(await db.exists('table', 'mythirdapp.customers')).toBe(false);

* we need to assess, is this the appriopriate API for revertModule?
* are the underlying methods used by revertModule passing down all the needed information?

please carefully make sure that we can revert back to a change, and also revert a tag. 

our tag resolution should be higher up in the API surface, but I believe the LaunchQLMigrate class already handles this, we should check







## Critical Test Scenarios

### Deployment Failure Recovery
- [ ] **Automatic Rollback on Failed Deployment**: When a deployment fails mid-way, the system should automatically revert to the last successful state (e.g., @v1.0.0)
  - **Scenario**: Deploy changes A, B, C where C fails → should auto-revert B and A
  - **Tag Support**: Should support reverting to a tagged state when deployment fails
  - **Cross-Module**: Handle failures that span multiple modules in a project

- [ ] **Manual Recovery from Failed State**: Test scenarios where deployment fails and manual intervention is needed
  - **Partial Deployment**: Some modules succeed, others fail
  - **Dependency Conflicts**: Failed due to unmet dependencies
  - **Database Constraints**: Failed due to FK violations or other constraints

### Advanced Revert Scenarios
- [ ] **Fork and Modify After Revert**: Rollback to a point, modify a previously depended-on change & plan, then redeploy with recursive
  - **Use Case**: Production hotfix requiring modification of historical changes
  - **Challenge**: Maintaining dependency integrity after modification
  - **Test**: Revert to @v1.0, modify base schema, redeploy to @v2.0

### Validation Enhancements
- [ ] **SQL Syntax Validation**: Validate should check for SQL syntax errors in change files
  - **Pre-deployment Check**: Catch SQL errors before attempting deployment
  - **Integration**: Should work with both deploy and verify commands
  - **Reporting**: Clear error messages indicating file and line number

### Cross-Package Dependencies
- [ ] **Multiple Package References**: Handle packages referencing each other multiple times (non-circular)
  - **Question**: Can we treat packages like files for dependency resolution?
  - **Example**: PackageA → PackageB (auth), PackageA → PackageB (utils)
  - **Resolution**: Need clear dependency graph visualization

## Revert and Rollback Capabilities

### ✅ Completed Features
- [x] Support reverting individual modules
- [x] Support transaction control for reverts
- [x] Support external extension cleanup with CASCADE
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (revert to specific change)

### 🚧 Missing Features
- [ ] **Recursive Tag-Based Revert** (Priority: High)
  - **Description**: Support reverting across multiple projects/modules using a single tag reference
  - **Example**: `launchql revert --recursive --to-tag @v1.0.0` reverts entire workspace
  - **Complexity**: Non-trivial - requires cross-project tag resolution

- [ ] **Cross-Package Dependency-Aware Revert** (Priority: High)
  - **Description**: Consider dependencies between packages when reverting
  - **Safety**: Prevent reverting changes that other packages depend on
  - **Example**: Can't revert auth:users if app:sessions depends on it

- [ ] **Workspace-Wide Recursive Revert** (Priority: Medium)
  - **Description**: Revert all packages in workspace in correct order
  - **Use Case**: Full environment rollback for disaster recovery
  - **Implementation**: Extension of package-level logic to workspace

- [ ] **External Extension Cleanup Verification** (Priority: Medium)
  - **Description**: Verify CASCADE cleanup doesn't impact cross-package dependencies
  - **Risk**: External extensions might be shared across packages
  - **Solution**: Add dependency checking before CASCADE operations

## Deploy Capabilities

### ✅ Completed Features
- [x] Support deploying individual modules
- [x] Support deploying individual packages  
- [x] Support deploying via tag (using `toChange` parameter)
- [x] Support transaction control for deployments
- [x] Support dependency resolution within projects
- [x] Support external extension management
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (deploy up to specific change)

### 🚧 Missing Features
- [ ] **Recursive Tag-Based Deploy** (Priority: High)
  - **Description**: Deploy to a specific tag across entire package graph
  - **Consistency**: Ensure all packages deploy to compatible versions
  - **Example**: `launchql deploy --recursive --to-tag @v2.0.0`

- [ ] **Cross-Package Dependency Resolution** (Priority: High)
  - **Description**: Resolve dependencies across package boundaries
  - **Challenge**: Loading and parsing external package plans
  - **Cache**: Consider caching dependency graphs for performance

- [ ] **Workspace-Wide Recursive Deployment** (Priority: Medium)
  - **Description**: Deploy all packages in dependency order
  - **Optimization**: Could support parallel deployment of independent branches
  - **Progress**: Show deployment progress across all packages

## Verify Capabilities

### ✅ Completed Features
- [x] Support verifying individual modules
- [x] Support verifying individual packages
- [x] Support external extension availability checking
- [x] Support Sqitch compatibility mode
- [x] Support change state validation
- [x] Support dependency order verification

### 🚧 Missing Features
- [ ] **Tag-Based Verification** (Priority: Medium)
  - **Description**: Verify deployment state matches a specific tag
  - **Use Case**: Ensure production matches expected version
  - **Output**: Report differences between current and tagged state

- [ ] **Recursive Package Graph Verification** (Priority: Medium)
  - **Description**: Verify entire package dependency graph
  - **Depth**: Follow dependencies across package boundaries
  - **Report**: Show verification status for each package/module

- [ ] **Workspace-Wide Recursive Verification** (Priority: Low)
  - **Description**: Verify all packages in workspace
  - **Summary**: Aggregate report of all verification results
  - **Performance**: Could benefit from parallel execution


## wish list

- [ ] auto-gen verify and revert based on the deploy
