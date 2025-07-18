# LaunchQL Core - Issues and Test Cases

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

### Cross-Project Dependencies
- [ ] **Multiple Project References**: Handle projects referencing each other multiple times (non-circular)
  - **Question**: Can we treat projects like files for dependency resolution?
  - **Example**: ProjectA → ProjectB (auth), ProjectA → ProjectB (utils)
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

- [ ] **Cross-Project Dependency-Aware Revert** (Priority: High)
  - **Description**: Consider dependencies between projects when reverting
  - **Safety**: Prevent reverting changes that other projects depend on
  - **Example**: Can't revert auth:users if app:sessions depends on it

- [ ] **Workspace-Wide Recursive Revert** (Priority: Medium)
  - **Description**: Revert all projects in workspace in correct order
  - **Use Case**: Full environment rollback for disaster recovery
  - **Implementation**: Extension of project-level logic to workspace

- [ ] **External Extension Cleanup Verification** (Priority: Medium)
  - **Description**: Verify CASCADE cleanup doesn't impact cross-project dependencies
  - **Risk**: External extensions might be shared across projects
  - **Solution**: Add dependency checking before CASCADE operations

## Deploy Capabilities

### ✅ Completed Features
- [x] Support deploying individual modules
- [x] Support deploying individual projects  
- [x] Support deploying via tag (using `toChange` parameter)
- [x] Support transaction control for deployments
- [x] Support dependency resolution within projects
- [x] Support external extension management
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (deploy up to specific change)

### 🚧 Missing Features
- [ ] **Recursive Tag-Based Deploy** (Priority: High)
  - **Description**: Deploy to a specific tag across entire project graph
  - **Consistency**: Ensure all projects deploy to compatible versions
  - **Example**: `launchql deploy --recursive --to-tag @v2.0.0`

- [ ] **Cross-Project Dependency Resolution** (Priority: High)
  - **Description**: Resolve dependencies across project boundaries
  - **Challenge**: Loading and parsing external project plans
  - **Cache**: Consider caching dependency graphs for performance

- [ ] **Workspace-Wide Recursive Deployment** (Priority: Medium)
  - **Description**: Deploy all projects in dependency order
  - **Optimization**: Could support parallel deployment of independent branches
  - **Progress**: Show deployment progress across all projects

## Verify Capabilities

### ✅ Completed Features
- [x] Support verifying individual modules
- [x] Support verifying individual projects
- [x] Support external extension availability checking
- [x] Support Sqitch compatibility mode
- [x] Support change state validation
- [x] Support dependency order verification

### 🚧 Missing Features
- [ ] **Tag-Based Verification** (Priority: Medium)
  - **Description**: Verify deployment state matches a specific tag
  - **Use Case**: Ensure production matches expected version
  - **Output**: Report differences between current and tagged state

- [ ] **Recursive Project Graph Verification** (Priority: Medium)
  - **Description**: Verify entire project dependency graph
  - **Depth**: Follow dependencies across project boundaries
  - **Report**: Show verification status for each project/module

- [ ] **Workspace-Wide Recursive Verification** (Priority: Low)
  - **Description**: Verify all projects in workspace
  - **Summary**: Aggregate report of all verification results
  - **Performance**: Could benefit from parallel execution


## wish list

- [ ] auto-gen verify and revert based on the deploy