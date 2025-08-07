# Deploying With Plans: usePlan vs loadPlanFiles and dependency resolution

This document explains how “deploy with plans” is intended to work, what the current code does, and proposes a plan to construct dependency resolution from plan files alone (without scanning every SQL file), aligning with the intent behind the `usePlan` option.

Scope:
- Where `usePlan` is used today and where it’s missing
- What `loadPlanFiles` means in the current resolver
- Why SQL files are still read in `resolveDependencies()` even when plans are present
- A concrete plan to construct the same `resolvedDeps` object from plan files only

References to the specific locations mentioned:
- Test: packages/core/__tests__/stage-fixture/staging-deployment.test.ts
- Test fixture: packages/core/test-utils/CoreDeployTestFixture.ts
- Migration client (deploy): packages/core/src/migrate/client.ts
- Dependency resolver: packages/core/src/resolution/deps.ts
- Fixture SQL example: __fixtures__/stage/packages/unique-names/deploy/schemas/unique_names/schema.sql


## 1) Trace of usePlan and where it’s used

- Test fixture sets usePlan: CoreDeployTestFixture passes usePlan: true in deployment options, but only when calling the project-level deploy wrapper:
  - packages/core/test-utils/CoreDeployTestFixture.ts (deployModule)
    - The call builds opts via getEnvOptions with:
      - deployment.fast: false
      - deployment.usePlan: true
      - deployment.logOnly: boolean
    - Then calls project.deploy(opts, target, true)

- Packaging honors usePlan:
  - packages/core/src/packaging/package.ts
    - packageModule(packageDir, { usePlan }) selects resolveWithPlan vs resolve when building the SQL package.
    - writePackage also threads usePlan through to packageModule.

- DeployOptions (used directly by LaunchQLMigrate.deploy) does not include usePlan:
  - packages/core/src/migrate/types.ts
    - DeployOptions = { modulePath, toChange?, useTransaction?, debug?, logOnly? }
    - No usePlan here today.

- Project-level deploy uses LaunchQLMigrate for non-fast path:
  - packages/core/src/core/class/launchql.ts → LaunchQLPackage.deploy()
    - If opts.deployment.fast is false, it constructs a LaunchQLMigrate client and calls client.deploy({ modulePath, toChange, useTransaction, logOnly }).
    - The migration client’s DeployOptions does not have usePlan, so the migrate path cannot switch behavior based on usePlan today.

Conclusion:
- usePlan exists and is respected in the packaging path (fast deployment path).
- In the non-fast “migrate” path, LaunchQLMigrate.deploy() has no knowledge of usePlan; thus it cannot choose a “plan-only” dependency resolution mode.


## 2) Call stack and intention of loadPlanFiles

- LaunchQLMigrate.deploy() calls resolveDependencies() with tagResolution: 'resolve' and loadPlanFiles: true:
  - packages/core/src/migrate/client.ts
    - It parses the plan file for the module to get the package name; then:
      - const resolvedDeps = resolveDependencies(packageDir, extname, { tagResolution: 'resolve', loadPlanFiles: true })

- resolveDependencies() implementation:
  - packages/core/src/resolution/deps.ts
    - Options include:
      - tagResolution: 'preserve' | 'resolve' | 'internal'
      - loadPlanFiles?: boolean
      - planFileLoader?: custom loader
    - loadPlanFiles controls whether to load launchql.plan files so tags can be resolved to changes.
    - Even when loadPlanFiles is true, the resolver still constructs the dependency graph by scanning SQL files in deploy/**/*.sql.
    - Plan files are only used to resolve “@tags” to concrete changes when tagResolution is 'resolve' or 'internal'.

Intended meaning (current code):
- loadPlanFiles: enable loading and parsing plan files to support tag resolution across modules.
- It does not switch the dependency source to the plan files. It only enhances the SQL-based dependency graph by resolving tags using plan metadata.


## 3) Why resolveDependencies reads deploy/*.sql even if we intend to use the plan

- Core behavior today:
  - The resolver builds the dependency graph by scanning every SQL file under deploy/**/*.sql.
  - It parses “-- requires: ...” lines to derive dependencies.
  - It also validates internal “-- Deploy ... to pg” headers to ensure file naming consistency.
  - Then it performs a dependency resolution (topological sort) and separates external dependencies.

- LaunchQLMigrate.deploy() consumes resolvedDeps:
  - packages/core/src/migrate/client.ts
    - For each change in the plan, it computes:
      - changeKey = /deploy/${change.name}.sql
      - resolvedChangeDeps = resolvedDeps.deps[changeKey] if present; otherwise fall back to change.dependencies from the plan.
    - This means the SQL-scan-based resolvedDeps can override the plan’s declared dependencies.

- Example that forced adding a requires line:
  - __fixtures__/stage/packages/unique-names/deploy/schemas/unique_names/schema.sql
    - A requires line referencing an external extension tag was added so tests would pass.
  - This illustrates that dependency resolution currently depends on the SQL “requires” headers; plan data alone isn’t used to build the “deps” graph that LaunchQLMigrate.deploy relies on.

Summary:
- Today, resolveDependencies always uses SQL files as the source of truth for building the “deps” graph, even if plan files exist and are loaded (loadPlanFiles) for tag resolution.


## 4) Proposal: build resolvedDeps from plan files only (no SQL scanning)

Goal:
- Create the same shape of data that LaunchQLMigrate.deploy() expects from resolveDependencies(): DependencyResult
  - { external: string[], resolved: string[], deps: Record<string, string[]>, resolvedTags?: Record<string, string> }
- But compute it solely from launchql.plan files (for the current package and any referenced packages), respecting tag resolution and current key formats.

Key requirements to keep behavior consistent:
- Keep dependency graph keys identical to current expectations:
  - Keys are file-like: '/deploy/{change}.sql' for changes within the current package.
- Preserve internal vs. external dependency semantics:
  - External references use "project:change" and are collected in external[].
  - Internal references may appear as bare "change" or "project:change" where project === current package; the resolver currently normalizes these.
- Support tags:
  - When tagResolution is 'resolve', resolve "project:@tag" to "project:change" using the corresponding plan’s tags list.
  - When 'internal', keep the original tag in output deps but also track a mapping in resolvedTags so internal resolution uses the mapped change.

Implementation options:

Option A: Extend resolveDependencies with a source: 'sql' | 'plan' option
- Default remains source: 'sql' to keep all existing behavior untouched.
- When source: 'plan', do NOT glob or read deploy/**/*.sql. Instead:
  1) Load the current package’s plan (must be available).
  2) For each change in the plan, create an entry in deps with key '/deploy/{change.name}.sql'.
  3) For each declared dependency in change.dependencies:
     - If it’s a tag reference 'project:@tag', resolve to 'project:change' when tagResolution is 'resolve', or keep the tag and record a tagMappings entry when 'internal'.
     - If it’s an external reference 'project:change' with project !== current package, add it directly and ensure external[] contains 'project:change'.
     - If it’s internal (bare change name or 'current:change'), normalize according to the internal resolution rules the existing code uses.
  4) Build the same dependency graph and run the existing dependency resolver (createDependencyResolver) to compute the resolved order and detect cycles.
  5) Return DependencyResult with the same shape as the SQL-based path.

- Tag resolution in plan-only mode:
  - Reuse the loadPlanFile and resolveTagToChange helpers already defined in packages/core/src/resolution/deps.ts to support referencing other packages’ plans and resolving tags consistently.

- Advantages:
  - Minimal duplication: keep all the core topological sort logic and external/internal handling in one place.
  - Maintains output shape and semantics expected by LaunchQLMigrate.deploy().

Option B: Add a new helper resolveDependenciesFromPlan(packageDir, extname, options)
- Implement the same logic as Option A but as a separate function that internally reuses createDependencyResolver.
- LaunchQLMigrate.deploy() would choose between resolveDependencies (SQL) and resolveDependenciesFromPlan (plan-only) based on a new usePlan flag.

Wiring usePlan through to deployment:
- Add usePlan?: boolean to DeployOptions in packages/core/src/migrate/types.ts.
- Thread opts.deployment.usePlan from LaunchQLPackage.deploy() into LaunchQLMigrate.deploy():
  - packages/core/src/core/class/launchql.ts: when calling client.deploy({...}), pass usePlan.
- In LaunchQLMigrate.deploy():
  - If options.usePlan is true, call the plan-only dependency resolver (Option A with source: 'plan' or Option B).
  - Otherwise, keep current behavior (source: 'sql').

Testing strategy (post-implementation):
- Unit tests in packages/core/__tests__/resolution should pass for both SQL and plan sources.
- Stage fixture test packages/core/__tests__/stage-fixture/staging-deployment.test.ts should pass with usePlan set to true without requiring additional '-- requires:' lines in SQL files.
- Add a new unit test to assert that when usePlan/source is 'plan', the resolver does not read SQL files (can be implemented by mocking file system access or by separating the code path clearly).

Notes on compatibility:
- LaunchQLMigrate.deploy() currently prefers resolvedDeps.deps[changeKey] over change.dependencies from the plan. The plan-only resolver must populate deps[changeKey] for every change to maintain behavior.
- The 'external' list should list external dependencies consistent with how the SQL-based path classifies them.


## Appendix: File references and relevant snippets

- Test that exposed the issue:
  - packages/core/__tests__/stage-fixture/staging-deployment.test.ts
    - Uses CoreDeployTestFixture.deployModule('unique-names', ...) which sets deployment.usePlan: true in env options, but the migrate path doesn’t use it today.

- Fixture SQL that required adding a requires line:
  - __fixtures__/stage/packages/unique-names/deploy/schemas/unique_names/schema.sql
    - Added: `-- requires: launchql-ext-default-roles:@0.0.5`
    - This line was necessary because resolveDependencies builds its dependency graph from SQL headers, not from the plan’s declared dependencies.

- Where LaunchQLMigrate.deploy() chooses resolver:
  - packages/core/src/migrate/client.ts
    - Always calls resolveDependencies(...) with tagResolution: 'resolve' and loadPlanFiles: true today.

- Dependency resolution and plan loading:
  - packages/core/src/resolution/deps.ts
    - loadPlanFiles: enables plan loading only to resolve tags, not to replace SQL scanning.
    - SQL scanning: globs deploy/**/*.sql and parses “-- requires: …” for building deps graph.
    - Internal/external and tag-resolution logic lives here; this is where a plan-only input mode can be added with minimal code duplication.

- usePlan propagation gaps:
  - packages/core/src/packaging/package.ts: usePlan is active for packaging.
  - packages/core/src/migrate/types.ts: DeployOptions missing usePlan.
  - packages/core/src/core/class/launchql.ts: project deploy path cannot pass usePlan into LaunchQLMigrate due to missing type option.
