# Dependency Resolution (resolveDependencies)

Audience: launchql/core contributors and users integrating deployment logic

This document explains how dependency resolution works in Core, centered around the resolveDependencies function. It covers purpose, signature, options, internal behavior for both SQL- and Plan-driven workflows, tag handling, external dependencies, errors, and examples.

Overview
- Purpose: Compute the execution order of changes for a package and provide its dependency graph.
- Inputs: Either deploy/**/*.sql headers (source: 'sql') or plan files (source: 'plan'), plus options controlling tag handling and plan loading.
- Outputs: A consistent shape that includes:
  - resolved: ordered list of change names for the current package
  - deps: dependency graph for internal and cross-package edges
  - external: list of cross-package references discovered during analysis
  - resolvedTags: mapping from tag tokens to concrete changes when using internal tag resolution

Function Signature
- resolveDependencies(packageDir: string, extname: string, options?: DependencyResolutionOptions): DependencyResult

Parameters
- packageDir: Absolute path to the package directory whose changes should be resolved.
- extname: Package name used in plan files and cross-package references.
- options: Configuration object; see DependencyResolutionOptions below.

Return Value (DependencyResult)
- resolved: string[]
  - source: 'sql' → topologically sorted list of changes for the package with extensions/* moved first afterward.
  - source: 'plan' → exactly the order from plan.changes for the current package (no re-sorting).
- deps: Record<string, string[]>
  - Dependency graph keyed by change/module name, including edges to internal and cross-package dependencies.
- external: string[]
  - Cross-package dependencies encountered (e.g., otherPackage:changeName).
- resolvedTags?: Record<string, string>
  - When tagResolution is 'internal', maps tag tokens to the concrete changes used internally for graph traversal.

DependencyResolutionOptions
- tagResolution?: 'preserve' | 'internal' | 'resolve' (default: 'preserve')
  - preserve: Keep tag tokens as authored; graph edges may include tags.
  - internal: Resolve tags internally for graph traversal but preserve original tokens in the returned resolved list. Returns resolvedTags mapping token → change.
  - resolve: Fully resolve tags to concrete change names everywhere (graph and resolved).
- loadPlanFiles?: boolean (default: true)
  - Enables loading plan files when needed (e.g., to resolve tags), applicable to both 'sql' and 'plan' sources.
- planFileLoader?: (projectName: string, currentProject: string, packageDir: string) => ExtendedPlanFile | null
  - Override to load plan data from custom locations in tests or specialized environments.
- source?: 'sql' | 'plan' (default: 'sql')
  - 'sql': parse deploy/**/*.sql headers; topo sort + extensions-first resorting.
  - 'plan': build graph from plan files; resolved is exactly plan.changes for this package.

Behavior by Source Mode
1) source: 'sql'
- Reads deploy/**/*.sql headers to collect dependencies (requires).
- Builds a dependency graph. Recognizes:
  - Local changes: changeA/substep
  - Cross-package references: otherPkg:changeB
  - Tags: @tagX and otherPkg:@tagY (behavior depends on tagResolution)
- Adds a synthetic root (_virtual/app) to feed all local modules to the resolver, computes a topological order, removes the synthetic root, then moves extensions/* first in the final order.
- Tag handling:
  - preserve: leave tags as-is in deps and resolved
  - internal: resolve tags for traversal; keep tokens in resolved; emit resolvedTags
  - resolve: replace tags with concrete change names everywhere

2) source: 'plan'
- Loads the plan for the current package and uses it as the authoritative intra-package order.
- resolved is exactly plan.changes.map(c => c.name) for the current package.
- Builds deps and collects external references from plan-defined dependencies.
- Tag handling mirrors the 'sql' mode semantics but uses plan data for lookups.
- No topo sort, no synthetic root, no extensions-first resorting. Plan authors control the order.

External Dependencies
- Any dependency that references another package (format: otherPkg:changeName) is:
  - Added to external
  - Represented in deps as an edge
- resolveDependencies does not compute a global cross-package order. Higher-level orchestration must coordinate sequencing across packages using these signals.

Tag Handling Reference
- Supported tokens:
  - Local tag: @tagName
  - Cross-package tag: otherPkg:@tagName
- Modes:
  - preserve: no tag resolution; tokens are retained
  - internal: resolve for graph traversal; tokens preserved in resolved; resolvedTags provided
  - resolve: tags replaced by concrete change names everywhere

Error Conditions
- source: 'plan' without a plan file for the current package → error.
- 'sql' mode: referencing a local change that cannot be found in deploy/**/*.sql → error.
- Tag resolution failures in 'internal' or 'resolve' may produce traversal errors or leave tokens depending on the mode and target availability.

Internals Overview (What happens inside resolveDependencies)
- Option defaults are applied (tagResolution='preserve', loadPlanFiles=true, source='sql').
- Plan files can be loaded on demand, with caching and optional planFileLoader override.
- Tag-to-change mapping is done using plan data when available and requested by tagResolution.
- For 'plan' mode:
  - Graph is built from plan.changes dependencies; external and tag mappings tracked.
  - resolved mirrors plan.changes; no topo or resorting.
- For 'sql' mode:
  - Graph constructed from SQL headers.
  - dep_resolve runs from a synthetic root to compute topological order.
  - Synthetic root removed; extensions/* moved first in the final list.
- Returned structure is consistent across modes: { external, resolved, deps, resolvedTags }

Examples
1) Default SQL resolution
- const res = resolveDependencies(pkgDir, 'unique-names')
- Behavior: parses headers, topo sorts, moves extensions first; tags preserved by default.

2) SQL with fully resolved tags
- const res = resolveDependencies(pkgDir, 'unique-names', { source: 'sql', tagResolution: 'resolve' })
- Behavior: tags (@v1, otherPkg:@core) are resolved to concrete change names everywhere.

3) Plan-driven resolution
- const res = resolveDependencies(pkgDir, 'unique-names', { source: 'plan', tagResolution: 'resolve' })
- Behavior: order equals plan.changes; deps from plan; external from cross-package plan deps; no re-sorting.

4) Internal tag resolution (plan or sql)
- const res = resolveDependencies(pkgDir, 'unique-names', { tagResolution: 'internal' })
- Behavior: graph traversal uses concrete targets; resolvedTags returned; resolved preserves tokens.

Practical Guidance
- Prefer 'plan' when the plan file is the source of truth for intra-package sequencing.
- Use 'sql' when plan files are absent or advisory, or during migration toward plans.
- If you need deterministic output without tags, use tagResolution='resolve'.
- If you want human-readable tokens in outputs but still need a concrete graph, use tagResolution='internal'.

Notes
- Cross-package orchestration is not handled here; use the external list and deps to schedule across packages at a higher layer.
- extensions/* ordering is applied automatically only in 'sql' mode. In 'plan' mode, place extensions in the desired order inside plan.changes.

Related Code
- Core implementation: packages/core/src/resolution/deps.ts → resolveDependencies, DependencyResolutionOptions.
- Dependency resolver: createDependencyResolver (same file) and its transformModule variants.
- Upstream caller: packages/core/src/migrate/client.ts (LaunchQLMigrate.deploy).
- Tests: packages/core/__tests__/resolution/*, packages/core/__tests__/migration/stage-deployment.test.ts, and packages/core/__tests__/projects/stage-workspace.test.ts.
