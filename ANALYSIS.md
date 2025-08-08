# Analysis: Plan-Mode Dependency Resolution, Placement, and Deployment Options

Audience: maintainers of launchql/core

Date: 2025-08-08

Author: Devin AI (with @pyramation)


## Executive Summary

- Moving plan-mode ordering into resolveDependencies is a sound architectural choice: it centralizes dependency graph construction and ordering for both “sql” and “plan” sources, keeping a single contract that callers use.
- The new behavior for source === 'plan' correctly honors plan.changes order and avoids topo/extension resorting. This aligns with the semantics of plans as the source of truth for within-package sequencing.
- There is an alternative: implement plan-mode ordering “above” resolveDependencies (e.g., within LaunchQLMigrate.deploy), but this would fragment dependency logic across layers and erode the single-entry-point benefit of resolveDependencies.
- We should not remove fast yet, nor non-recursive, without a dedicated cleanup pass and confirmation of external usage. Long-term, we can streamline: plan-mode plus recursive deployment likely covers most real workflows, but deprecations should be gradual and data-driven.


## Current resolveDependencies: What it does

resolveDependencies(packageDir, extname, options) returns:
- resolved: ordered list of modules/changes to apply for the current package
- deps: a dependency graph keyed by change/module
- external: list of cross-package edges (dependencies referencing another package)
- resolvedTags: when tagResolution requires tag mapping

Core behaviors and options in play:
- Source selection
  - source: 'sql' (default) — scan deploy/**/*.sql headers to build dependency graph; toposort the graph; then apply extension-first resorting; resolve tags as needed
  - source: 'plan' — use plan files for graph inputs and use plan.changes order directly for intra-package sequencing; still collect deps and externals; tags handled per tagResolution
- Tag resolution
  - tagResolution: 'preserve' | 'internal' | 'resolve'
  - loadPlanFiles: controls plan loading for tag resolution when needed
  - planFileLoader: allows testability/overrides
- In 'sql' mode
  - Parse SQL files, capture requires lines (including tags), build dependency graph
  - Use a dependency resolver (dep_resolve) to topologically sort starting from synthetic root (_virtual/app)
  - Remove synthetic root and apply a second-phase resort putting extensions/* first
- In 'plan' mode (after our changes)
  - Load plan for the current package
  - Build deps graph from plan.changes dependencies (including handling of tags based on tagResolution)
  - Track externals for cross-package references, but do not reorder intra-package sequence
  - resolved is exactly plan.changes order


## Is resolveDependencies the right layer for plan-mode ordering?

Yes—centralizing is preferable:
- Single contract for all callers: deployment code doesn’t need to know how the order is derived; it just requests the mode and receives a consistent result shape.
- Reduced duplication: the graph building, tag handling, and external tracking logic remains in one place across modes.
- Tighter testability: resolution unit tests verify both 'sql' and 'plan' behaviors via fixtures; staging/deployment tests confirm E2E outcomes.

What “above the stack” would look like:
- If LaunchQLMigrate.deploy or a higher layer sorted by plan.changes before calling resolveDependencies, we would need to request a “no-op” resolution, or we’d risk double ordering or conflicting semantics.
- It would also push tag resolution concerns up-stack, or force weird flags to disable normal resolution behavior—both less clean than switching source in a central place.

Conclusion: keeping plan-mode logic inside resolveDependencies is the right place.


## Is our solution good?

Strengths:
- Aligns plan-mode with the semantic expectation: plans define the precise intra-package order.
- Preserves the same return structure (resolved, deps, external, resolvedTags), so callers don’t need mode-specific branching.
- Keeps SQL-mode behavior unchanged, minimizing regressions.

Caveats:
- Some downstream code might implicitly rely on “extensions first” ordering. In plan-mode, extensions are placed wherever the plan author set them. This is correct but worth documenting as a behavior change when switching modes.
- External references still appear in the deps graph and are exposed via external; execution coordination for cross-package edges remains a responsibility of the higher-level deployment logic.


## Should plan resolution happen above resolveDependencies?

Considerations:
- Above-layer plan sorting would complicate call sites and distribute logic across layers.
- resolveDependencies is already the cohesive layer for:
  - reading inputs (SQL or plan)
  - tag resolution mapping
  - dependency graph assembly
  - determining intra-package execution order

Recommendation: keep plan resolution in resolveDependencies. If another layer needs different behavior, that layer can provide options (e.g., a different planFileLoader) but not re-implement order semantics.


## Should we remove the “fast” option?

Context:
- “Fast” deploy path exists to optimize certain workflows (e.g., workspaces or reduced parsing/IO).
- The newly improved plan-mode already avoids file parsing for order derivation when usePlan is true, overlapping with some “fast” motivations.

Pros of removal:
- Fewer modes to maintain and test.
- Reduced conceptual surface for users: pick source (sql/plan), and go.

Cons of removal:
- There could be existing consumers relying on “fast” behaviors beyond ordering (e.g., caching or IO patterns).
- Removing it without telemetry/user feedback risks regressions.

Recommendation:
- Do not remove fast now.
- Add a deprecation plan:
  - Document overlaps and encourage plan-mode where applicable.
  - Gather feedback/telemetry (in CI logs or from maintainers) about “fast” usage.
  - If redundancy is confirmed, schedule a follow-up PR to deprecate and remove fast safely.


## Should we remove non-recursive and default to recursive?

Context:
- Deploy workflows can be recursive (walk package graph) or non-recursive (current package only).
- Non-recursive is narrower; recursive aligns with most real-world deployments where packages depend on one another.

Pros of defaulting to recursive:
- Matches common expectations in monorepos/package graphs.
- Less room for surprises where dependencies are missed.

Cons:
- Tooling might have explicit workflows that rely on non-recursive behavior for controlled sequencing, dry runs, or partial releases.

Recommendation:
- Keep both for now; default to recursive in UX but do not remove non-recursive.
- If simplification is a goal, deprecate non-recursive later with clear messaging and a migration path.


## Risks and Follow-ups

- Document plan-mode behavior differences explicitly:
  - No extension-first resorting; order is as authored in plan.changes.
  - Externals are tracked but not used to reorder the in-package sequence.
- Add a small integration guard:
  - A test asserting that in plan-mode, if the plan author puts an extension later, the resolved order reflects exactly that.
- Monitor CI and real deployments for any consumers who implicitly depended on SQL-mode resorting while expecting plan-mode semantics.


## Recommendations Summary

- Keep plan-mode ordering inside resolveDependencies. This is the right layer and our change is sound.
- Leave “fast” and non-recursive in place for now; plan a later deprecation only after gathering usage/impact data.
- Improve docs around plan-mode semantics and differences vs sql-mode.
- Maintain and extend tests asserting exact plan.changes ordering for plan-mode using the stage fixture.

## resolveDependencies: Detailed Reference

Purpose
- Build a dependency graph for a package and return the execution order for its changes
- Support two sources of truth for determining the order and graph:
  - SQL mode: parse deploy/**/*.sql headers
  - Plan mode: read plan files and use plan.changes ordering directly

Signature
- resolveDependencies(packageDir: string, extname: string, options?: DependencyResolutionOptions)
  - packageDir: absolute path to the package root whose changes we are resolving
  - extname: the package name used in plan files and cross-package references
  - options: controls tag handling, plan-file loading, and the dependency source

Inputs
- SQL files and their headers inside packageDir/deploy for source: 'sql'
- Plan files (global or per-package) when loadPlanFiles is enabled and/or source: 'plan'
- Options (see below)

Outputs
- resolved: string[] — ordered list of change names for the current package
  - In sql mode: toposorted and then extension-first resorting
  - In plan mode: exactly the order specified in plan.changes for this package
- deps: Record<string, string[]> — dependency graph keyed by change/module (normalized)
  - Contains edges to internal changes and cross-package “external” references
- external: string[] — list of cross-package dependency references seen during resolution
  - Entries are in the form "otherPackage:changeName" or sometimes tags resolved into that form
- resolvedTags: Record<string, string> — mapping of original tag references to concrete changes when tagResolution is 'internal' (internal-only remapping)

DependencyResolutionOptions
- tagResolution?: 'preserve' | 'resolve' | 'internal' (default: 'preserve')
  - preserve
    - Keep tag-like references as-is in the deps graph and resolved list
    - No tag mapping for output; tags are not resolved to changes
  - internal
    - Resolve tags internally for graph traversal and dependency edges
    - Return resolvedTags mapping while preserving original tag tokens in the final resolved output (i.e., changes appear as authored, but internal graph uses concrete edges)
  - resolve
    - Fully resolve tags to their concrete target changes in both graph and resolved output
- loadPlanFiles?: boolean (default: true)
  - When true, plan files are loaded to support tag resolution for 'resolve' and 'internal' modes and any plan-aware operations
  - Has effect in both sql and plan sources if tag resolution needs to look up tags
- planFileLoader?: (projectName: string, currentProject: string, packageDir: string) => ExtendedPlanFile | null
  - Override for how plan files are located and parsed
  - Useful in tests or specialized environments
- source?: 'sql' | 'plan' (default: 'sql')
  - sql: parse SQL headers to construct the dependency graph and order
  - plan: build graph from plan files and use plan.changes order directly for this package

Mode-by-Mode Behavior
1) source: 'sql'
- Scans packageDir/deploy/**/*.sql headers to collect requires/dependencies
  - Supports references of the following shapes:
    - Plain internal change name: changeA
    - Cross-package change: otherPkg:changeB
    - Tags: @tagX or otherPkg:@tagY
- Builds the dependency graph (deps) keyed by normalized change names
- Uses a synthetic root (_virtual/app) to feed all local changes to a dependency resolver (dep_resolve) and produce a topological order
- Removes the synthetic root
- Applies a final deterministic resorting step that places modules under extensions/ first, followed by the rest
- Tag handling:
  - preserve: do not resolve tags; edges use tag tokens where encountered
  - internal: tags are resolved internally for edge traversal; resolvedTags maps original tags to change names; return resolved still preserves original tokens
  - resolve: tags are resolved to changes in both edges and final resolved output

2) source: 'plan'
- Loads the plan for the current package (extname). Fails if the plan is missing
- Iterates through plan.changes to build deps and gather edges, including any local or cross-package dependencies specified in the plan
- Tag handling mirrors sql mode semantics (preserve/internal/resolve) using plan lookups
- Collects external references for cross-package edges encountered
- resolved is the exact list plan.changes.map(ch => ch.name) for the current package
  - No dependency toposort or extension-first resorting in plan mode
  - Intra-package order is entirely authored by the plan
- Rationale: plan files are the source of truth for sequencing; they may intentionally order extensions or other modules in a specific place

Edge Cases and Normalization
- Normalization for internal references:
  - When references are authored as extname:localChange and extname matches the current package, they are normalized to localChange internally
- Cross-package edges (external)
  - Any dependency referencing a different project/package is added to external and also represented in deps as an edge to a non-local node
  - The resolver returns external references so higher-level orchestration can reconcile execution across packages
- Missing plan or tags
  - In plan mode, absence of a plan for the current package is an error
  - Tag lookups that fail to resolve yield either unchanged tag tokens (preserve) or may lead to missing-edge errors depending on mode and usage
- Extensions namespace
  - Only sql mode applies the extension-first resort at the end; plan mode uses plan-defined order, including where extensions appear

Examples and Use Cases
- Standard SQL-driven deployment (default)
  - Call with source omitted or source: 'sql' to parse SQL headers, compute a topo order, and run extensions first
  - Useful when plan files are not present, or when plan files are advisory rather than authoritative
- Plan-driven deployment (usePlan = true at higher level)
  - Higher-level code passes source: 'plan' to resolveDependencies
  - The execution order follows plan.changes exactly for the current package
  - Cross-package edges remain recorded in external and deps for orchestration by deploy logic
- Tag strategies
  - preserve: best for displaying human-authored tags while still understanding graph shape from raw dependencies
  - internal: ensures a concrete graph for traversal but preserves original tokens in returned order; useful for diagnostics
  - resolve: consumers expect final, concrete change names everywhere

Caller Responsibilities and Integration
- LaunchQLMigrate.deploy determines whether to request plan or sql mode
  - When usePlan is enabled in DeployOptions, the caller passes source: 'plan'
  - Otherwise, it relies on sql parsing by default
- Cross-package execution ordering is not handled by resolveDependencies
  - The function exposes external references; the caller should coordinate multi-package application order if needed
- Recursive vs non-recursive deploy behaviors occur at a higher layer
  - resolveDependencies only handles the current package’s internal order and emits external references for the caller

Operational Guidance
- Prefer plan mode when you want unambiguous, explicit intra-package order governed by the plan file
- Use sql mode for projects that don’t maintain plan files, or when plan files are being migrated in gradually
- Be aware of extension ordering differences:
  - sql mode places extensions/ first automatically
  - plan mode keeps the authored order, which may place extensions later if desired by the author
- Choose tagResolution based on output expectations and graph needs:
  - 'resolve' for concrete names everywhere
  - 'internal' for concrete traversal but readable returned tokens
  - 'preserve' for minimal interference with authored references

Validation and Testing Notes
- Unit tests exist to snapshot outcomes for both sql and plan sources, including the stage fixture
- End-to-end tests validate that deployments using usePlan produce the expected sequencing and that external references are accounted for without reordering plan-defined order

Future Considerations
- If the ecosystem standardizes on plan files, sql mode could become a compatibility mode
- With enough adoption, fast and certain specialized modes may be consolidated, but deprecations should be data-driven and gradual
- Additional diagnostics (e.g., emitting a warning when plan-mode ordering conflicts with inferred sql-mode topo) can help teams detect drift between plan and headers

## Examples

Example 1: SQL-driven resolution (default)
- Goal: Parse SQL headers to derive execution order, with extensions first
- Call:
  - const res = resolveDependencies(pkgDir, 'unique-names')
  - Equivalent to { source: 'sql', tagResolution: 'preserve', loadPlanFiles: true }
- Result:
  - res.resolved is a topo order (extensions/* appear first)
  - res.deps includes edges inferred from requires lines in SQL headers
  - res.external includes any otherPkg:change edges found in headers
  - res.resolvedTags is empty since tagResolution defaults to 'preserve'

Example 2: SQL with fully resolved tags
- Goal: Consumers want concrete change names everywhere
- Call:
  - const res = resolveDependencies(pkgDir, 'unique-names', { source: 'sql', tagResolution: 'resolve' })
- Result:
  - Tags like @v1 and otherPkg:@core are resolved to concrete change names in both deps and resolved
  - Plan files may still be loaded for tag lookups if necessary (loadPlanFiles defaults to true)

Example 3: Plan-driven resolution (usePlan)
- Goal: Honor plan.changes exactly for intra-package order, do not resort
- Call:
  - const res = resolveDependencies(pkgDir, 'unique-names', { source: 'plan', tagResolution: 'resolve' })
- Result:
  - res.resolved equals plan.changes.map(c => c.name) for package unique-names
  - res.deps is built from plan-defined dependencies (with tags resolved)
  - res.external lists cross-package edges found in the plan
  - No synthetic root, no toposort, no extensions-first resorting

Example 4: Internal tag resolution (plan or sql)
- Goal: Concrete graph traversal while preserving human-authored tag tokens in the returned resolved list
- Call:
  - const res = resolveDependencies(pkgDir, 'unique-names', { source: 'plan', tagResolution: 'internal' })
- Result:
  - deps uses concrete targets for edges so the graph is resolvable
  - resolvedTags maps each tag token to the concrete change name used internally
  - res.resolved preserves the originally authored tokens

Example 5: Custom plan loader
- Goal: Override plan discovery in specialized setups or tests
- Call:
  - const res = resolveDependencies(pkgDir, 'unique-names', {
      source: 'plan',
      planFileLoader: (projectName, currentProject, dir) => loadFromCustomLocation(projectName, dir)
    })
- Result:
  - The provided planFileLoader is used for any plan access for the current and external packages


## Error Conditions and Diagnostics

- Missing plan in plan mode
  - If source is 'plan' and no plan file can be found for extname, resolveDependencies throws an error
  - Action: create/locate launchql.plan for this package or switch to source: 'sql'
- Unknown internal module (sql mode)
  - If a change is referenced internally but is not discoverable in deploy/**/*.sql, an error is thrown
  - Action: ensure the change exists and is correctly named; verify header requires
- Unresolvable tags
  - In 'resolve' or 'internal' modes, failure to find a tag’s target may result in either leaving tokens intact (preserve) or a traversal error depending on usage
  - Action: verify the tag exists in the plan for the correct package, or switch tagResolution to 'preserve'
- Cross-package references
  - Cross-package dependencies are recorded in external and appear in deps; ordering across packages is not handled here
  - Action: ensure higher-level deploy logic reconciles execution order across packages based on external
- Extensions ordering expectations
  - Only SQL mode guarantees extensions/* first; plan mode uses the authored order
  - Action: if your plan requires extensions first, place them first in plan.changes


## Tag Reference Cheatsheet

Tag token formats supported in dependencies:
- Local tag: @tagName
- Cross-package tag: otherPkg:@tagName

Resolution behavior per tagResolution:
- preserve
  - Leave tag tokens unchanged everywhere
  - deps may include tag tokens as edges
- internal
  - Resolve tags for graph traversal only
  - Return resolvedTags mapping from token -> changeName
  - res.resolved preserves original tokens
- resolve
  - Resolve tags everywhere into concrete change names
  - No tag tokens remain in deps or resolved


## Option Behavior Matrix (high level)

- source: 'sql'
  - Input: deploy/**/*.sql headers
  - Order: dep_resolve with synthetic root, then extensions-first resort
  - Tags: per tagResolution; may load plan files to resolve targets if requested
- source: 'plan'
  - Input: plan files (current and referenced packages)
  - Order: exactly plan.changes for the current package; no resorting
  - Tags: per tagResolution against plan data

- tagResolution: 'preserve'
  - No resolution performed; tokens are kept as-is
- tagResolution: 'internal'
  - Graph is concrete; tokens preserved in output + returned in resolvedTags
- tagResolution: 'resolve'
  - Both graph and output use concrete change names

- loadPlanFiles: true (default)
  - Tags can be resolved via plan data; applicable in both sql and plan modes if tags are present
- planFileLoader: custom
  - Allows tests/integration environments to supply plan content from non-standard locations


## Practical Guidance

- Prefer plan mode for authoritative, explicit sequencing; it mirrors intent as written by the plan’s author
- Use sql mode when migrating toward plans or when plans are advisory
- Choose tagResolution based on your consumer’s expectations for output:
  - Use resolve when consumers cannot handle tag tokens
  - Use internal when you want both precise graphs and human-readable tokens in outputs
  - Use preserve for minimal intervention and exploratory graph inspection
- Remember external orchestration is the caller’s job; resolveDependencies only returns signals (external and deps), not a global ordering across packages

## Function Internals: Step-by-Step Flow (resolveDependencies)

High-level
- Entry: resolveDependencies(packageDir, extname, options)
- Unpack options with defaults: tagResolution='preserve', loadPlanFiles=true, source='sql', optional planFileLoader
- Initialize planCache and define loadPlanFile(projectName) and resolveTagToChange(projectName, tagName)
- Branch by source:
  - plan: build deps/external using plan data; compute resolved directly from plan.changes
  - sql: scan deploy/**/*.sql, build deps/external, topologically sort via dep_resolve with a synthetic root, remove root, resort extensions first
- Return { external, resolved, deps, resolvedTags }

Detailed steps

Common helpers
1) loadPlanFile(packageName)
   - If loadPlanFiles=false, return null
   - If planFileLoader provided, use it
   - Otherwise, cache and resolve path:
     - For current package: packageDir/launchql.plan
     - For external packages: use new LaunchQLPackage(packageDir).getModuleMap()[packageName] to find module root; then read moduleRoot/launchql.plan
   - Parse into ExtendedPlanFile and cache
2) resolveTagToChange(projectName, tagName)
   - Loads plan for given projectName via loadPlanFile
   - Finds tag by name and returns tag.change or null

Plan mode (source: 'plan')
3) Load current package plan via loadPlanFile(extname)
   - If missing, throw error (plan is required in plan mode)
4) Initialize
   - external: string[]
   - deps: Record<string, string[]>
   - resolvedTags: Record<string, string>
5) Iterate plan.changes in authored order
   - For each change ch, use key = makeKey(ch.name), init deps[key] = []
   - For each dependency dep on the change:
     - If dep contains '@' (tag token):
       - Handle local @tag or cross-package otherPkg:@tag:
         - Resolve using resolveTagToChange; if tagResolution is 'resolve', replace token with "pkg:change"
         - If 'internal', keep token but store mapping in resolvedTags[token] = "pkg:change"
     - If dep contains ':' (cross-package format “pkg:change”):
       - If pkg !== extname → cross-package: push to external, ensure deps[dep] exists, and add dep as edge of current key
       - If pkg === extname → normalize to local change name and add to deps[key]
     - Else (plain local change), add to deps[key]
6) Build transformModule(sqlmodule, extnameLocal)
   - Used by internal dependency traversal logic; applies tagResolution rules and normalization for local vs external references
   - In plan mode, resolved is not computed via the resolver; transformModule supports consistency and future traversal if needed
7) Compute resolved
   - resolved = plan.changes.map(ch => ch.name)
   - No topo sort; no extension-first resorting
8) Return { external, resolved, deps, resolvedTags }

SQL mode (source: 'sql')
9) Initialize external, deps, resolvedTags similarly
10) Walk deploy/**/*.sql to parse headers and populate deps
    - Capture requires lines; support tokens:
      - local change (foo/bar), cross-package (otherPkg:baz/qux), local tag (@v1), cross tag (otherPkg:@v1)
    - Apply tagResolution:
      - preserve: keep tokens as-is in deps
      - internal: resolve to concrete change in graph traversal but keep original tokens in res; track resolvedTags
      - resolve: replace tokens with concrete change names in deps
11) transformModule for sql mode
    - Normalizes internal refs (extname:change → change)
    - For external refs, records external and short-circuits edges appropriately
    - Applies internal tagMappings substitution if tagResolution='internal'
12) Use dependency resolver (dep_resolve) to topologically sort
    - Add synthetic root _virtual/app → edges of all local deploy/* modules
    - dep_resolve('_virtual/app', resolved, unresolved)
    - Remove synthetic root from resolved and deps
13) Apply extensions-first resorting
    - Split resolved into modules starting with extensions/ and the rest; re-concatenate with extensions first
14) Return { external, resolved, deps, resolvedTags }

Return Type
- type DependencyResult = {
  - external: string[]
  - resolved: string[]
  - deps: Record<string, string[]>
  - resolvedTags?: Record<string, string>
}

Related Utilities and Call Graph

- createDependencyResolver(deps, external, options)
  - Constructs a function dep_resolve(start, resolved, unresolved) that walks the dependency graph
  - Options include transformModule, makeKey, and extname which affect how modules are normalized and how external dependencies are recorded
- transformModule(sqlmodule, extnameLocal)
  - Encapsulates normalization and tag behavior per tagResolution
  - Handles internal vs external references and tagMappings when tagResolution='internal'
- makeKey(module: string) => string
  - Normalizes keys used for deps; in many cases identity, but centralizes naming for consistency
- LaunchQLPackage(packageDir)
  - getModuleMap() returns a mapping of package names to their root paths (used to locate external package plan files)
- Plan parsing
  - Plan files are parsed into ExtendedPlanFile (tags, changes, etc.), enabling tag and dependency lookups

Notes on Execution Scope
- resolveDependencies returns only the intra-package order (resolved)
- Cross-package references are surfaced via external and represented in deps but not ordered globally
- Higher-level orchestration (e.g., LaunchQLMigrate.deploy) coordinates execution across packages using these signals

FAQ
- Q: Why not topo sort in plan mode?
  - A: The plan author defines the sequence explicitly; re-sorting would invalidate intent and can cause subtle behavior changes
- Q: How do I ensure extensions run first in plan mode?
  - A: Place them first in plan.changes; plan mode honors authored order
- Q: Can I resolve tags without changing the final resolved tokens?
  - A: Yes, use tagResolution='internal'. The graph uses resolved edges, resolvedTags provides mappings, and the returned resolved preserves tokens

Linked Locations in Code
- Function: packages/core/src/resolution/deps.ts → resolveDependencies
- Options: DependencyResolutionOptions in the same file
- Resolver: createDependencyResolver and its transformModule implementations (sql and plan mode sections)
- Upstream caller: packages/core/src/migrate/client.ts (LaunchQLMigrate.deploy)
- Consumers in tests:
  - packages/core/__tests__/resolution/dependency-resolution-internal-tags.test.ts
  - packages/core/__tests__/resolution/dependency-resolution-resolved-tags.test.ts
  - packages/core/__tests__/stage-fixture/staging-deployment.test.ts
