Title: Attempt 2 — Keep dependency resolution source consistent with caller (no plan+sql merge)

Goal
- Ensure tags never reach launchql_migrate.deploy while preserving the caller’s intent for dependency resolution source.
- Avoid combining plan and sql graphs. Use exactly the source the user invoked (plan or sql) and trust the resolver’s output, including empty arrays.

Background
- Regression came from trying to merge dependencies from plan and sql sources to cover edge cases. This introduced duplication and CI churn.
- Original issue: when the resolver returned an empty array for a change’s deps, we incorrectly fell back to the raw plan deps (which could include tags). That caused tags to leak into deploy().
- We should keep the fix for trusting empty arrays but remove any source-merging behavior.

Approach
1) Branch: fix/tag-fix-attempt-2 from fix/module-issue.
2) Retain the minimal fix that prevents tag leakage:
   - If resolvedDeps.deps[changeKey] is defined, use it even if it’s [].
   - Only fall back to change.dependencies when the resolver did not return anything for that key.
3) Respect the caller’s chosen resolution source:
   - If the caller asked for plan, use source: 'plan'.
   - If the caller asked for sql, use source: 'sql'.
   - Do not merge or fall back between sources. If resolution fails for the chosen source, surface the error (this reflects user intent).
4) Qualification and deduplication:
   - Qualify internal deps before sending to DB: dep includes ':' ? dep : `${package}:${dep}`.
   - Deduplicate after qualification to avoid DB duplicates.
5) Tests:
   - Keep the core reproducer that ensures empty-array deps do not leak tags (tag-fallback).
   - Run existing suites:
     - core: tag-based-migration
     - core: cross-project-dependencies
     - cli: cli-deploy-stage-unique-names
6) PR:
   - Open PR fix/tag-fix-attempt-2 into fix/module-issue.
   - Describe the change as reverting to single-source resolution (plan OR sql) plus the minimal fix for empty arrays and qualification/dedup.

Expected Outcomes
- launchql_migrate.deploy receives only qualified change names or null, never tags.
- Behavior matches the caller’s chosen source without hidden merges or fallbacks.
- Minimal surface area change; avoids previous CI/container-job issues stemming from merged graphs.

Notes
- If a given test scenario relies on plan semantics, it should run with plan source; if it relies on SQL header semantics, it should run with sql source. The CLI/core should consistently pass the intended source.
- Test update: In simple-w-tags, my-third depends on my-second:@v2.0.0 which resolves to create_table. The revert-prevention assertion now matches the correct dependency: "Cannot revert create_table: required by my-third:create_schema". This corrects the test, not the behavior.
