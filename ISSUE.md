Title: Tag resolution not applied before calling launchql_migrate.deploy — empty resolved deps triggers fallback to raw (tag) deps

Summary
- The CLI deploy path ultimately calls LaunchQLPackage.deploy, which uses LaunchQLMigrate.deploy for the actual DB migration.
- LaunchQLMigrate.deploy attempts to resolve change dependencies via resolveDependencies with tagResolution: 'resolve'. However, when a change has no resolved dependencies (i.e., an empty array), the code falls back to the original change.dependencies from the plan, which can contain tags like package:@tag. This causes launchql_migrate.deploy to receive tags instead of resolved change names, leading to errors like "Missing required changes for ... : launchql-ext-default-roles:@0.0.5, launchql-ext-verify:@0.1.0".

Repro steps
1) Branch and setup:
   - git checkout fix/module-issue
   - From launchql-extensions:
     - docker-compose up -d
     - PGPASSWORD=password psql -h localhost -p 5432 -U postgres -f bootstrap-roles.sql
2) From repo root:
   - yarn && yarn build
3) Run targeted test:
   - cd packages/cli
   - yarn test:watch __tests__/cli-deploy-stage-unique-names.test.ts
4) Observe failure:
   - LaunchQLError: Deployment failed for module: unique-names
   - Root cause is ultimately missing resolved dependencies being replaced by tag tokens sent into launchql_migrate.deploy.

Expected vs actual
- Expected: All tag references are resolved to concrete change names before calling launchql_migrate.deploy; the procedure should receive arrays of change names, not tags.
- Actual: When resolveDependencies returns an empty array for a change’s deps, LaunchQLMigrate.deploy falls back to change.dependencies from the plan (which may include tags), resulting in tags being passed to the DB procedure.

Code paths and details
- CLI entry:
  - packages/cli/src/commands/deploy.ts
    - Builds opts (pg, deployment flags), constructs target, and calls project.deploy(opts, target, recursive).
- Project deploy:
  - packages/core/src/core/class/launchql.ts (LaunchQLPackage.deploy)
    - Orchestrates per-module deployments, ultimately using LaunchQLMigrate for actual DB changes.
- Migration client:
  - packages/core/src/migrate/client.ts (LaunchQLMigrate.deploy)
    - Loads plan: parsePlanFileSimple and parsePlanFile
    - Resolves tag dependencies: resolveDependencies(packageDir, packageName, { tagResolution: 'resolve', loadPlanFiles: true, source: options.usePlan ? 'plan' : 'sql' })
    - Then for each change:
      - const changeKey = `/deploy/${change.name}.sql`
      - const resolvedFromDeps = resolvedDeps?.deps[changeKey];
      - const resolvedChangeDeps = (resolvedFromDeps && resolvedFromDeps.length > 0) ? resolvedFromDeps : change.dependencies;
      - Calls: CALL launchql_migrate.deploy(..., resolvedChangeDeps.length > 0 ? resolvedChangeDeps : null, ...)

- Dependency resolver:
  - packages/core/src/resolution/deps.ts (resolveDependencies)
    - Two modes:
      - source: 'plan' builds deps graph from plan.changes order and supports tagResolution modes
      - source: 'sql' parses deploy/**/*.sql headers ('-- requires: ...') and supports tagResolution
    - For tagResolution: 'resolve', tag references like package:@tag are resolved via plan files to package:change.
    - In both 'plan' and 'sql' branches, deps[key] is set for each change, possibly to an empty array if no deps.

Root cause hypothesis (confirmed)
- In LaunchQLMigrate.deploy:
  - resolvedFromDeps is undefined if the key is absent; otherwise an array (possibly empty).
  - The code uses (resolvedFromDeps && resolvedFromDeps.length > 0) ? resolvedFromDeps : change.dependencies
  - This means:
    - If deps[changeKey] exists and has length > 0, we use the fully resolved deps (correct).
    - If deps[changeKey] exists but is an empty array (no deps), the condition is false and it falls back to change.dependencies (from plan), which may contain tags (incorrect).
    - If deps[changeKey] is undefined (graph missing key), it also falls back to change.dependencies (may be tags) (incorrect).
- Therefore, tags leak into launchql_migrate.deploy whenever the resolved deps array is empty (or key missing), even though tagResolution: 'resolve' was requested and we should not use the unprocessed plan dependencies in that case.

Why we see “Missing required changes for … : package:@x.y.z”
- The DB side expects change names, not tags. Passing package:@tag triggers its validation to fail since it’s not a change, thus the “missing required changes” error for the tag tokens.

Proposed fix
- In packages/core/src/migrate/client.ts within LaunchQLMigrate.deploy, change the fallback logic to only use plan’s change.dependencies when the resolver did not return anything at all (i.e., key is undefined), not when it returned an empty array.
- Specifically:
  - Instead of:
    - const resolvedChangeDeps = (resolvedFromDeps && resolvedFromDeps.length > 0) ? resolvedFromDeps : change.dependencies;
  - Use:
    - const resolvedChangeDeps = (resolvedFromDeps !== undefined) ? resolvedFromDeps : change.dependencies;
- This ensures:
  - If the resolver handled the change (deps[changeKey] exists), we trust that result even if it’s empty (no deps).
  - We only fall back to plan’s dependencies when no graph entry exists for the change. With tagResolution: 'resolve', that fallback generally shouldn’t include tags; but if it does, it highlights a separate parsing issue to address (not observed here).

Additional considerations
- resolveDependencies already performs tag resolution for both 'sql' and 'plan' sources when tagResolution is 'resolve'. So trusting its output (including empty arrays) is correct.
- LaunchQLMigrate.deploy currently ignores resolvedTags returned by resolveDependencies; that’s okay since we use the deps graph edges directly when present.
- If later we want to support 'internal' behavior, we should consistently apply tagMappings before passing deps into the DB layer, but that’s orthogonal to this bug.

Next steps
- Implement the small condition change in LaunchQLMigrate.deploy.
- Re-run yarn build and the targeted test. It should no longer pass tags to the DB procedure when a change has no deps, eliminating the “Missing required changes … @tag” error for this case.
- Optionally add a unit test covering the case where a change has no dependencies: verify that launchql_migrate.deploy receives null/empty deps rather than falling back to plan deps with tags.

Files/lines referenced
- packages/core/src/migrate/client.ts, LaunchQLMigrate.deploy:
  - Around lines:
    - changeKey: '/deploy/${change.name}.sql'
    - const resolvedFromDeps = resolvedDeps?.deps[changeKey];
    - const resolvedChangeDeps = (resolvedFromDeps && resolvedFromDeps.length > 0) ? resolvedFromDeps : change.dependencies;
- packages/core/src/resolution/deps.ts
  - resolveDependencies (both plan and sql branches) building deps[makeKey(ch.name)] arrays and handling tagResolution: 'resolve'.
- packages/cli/src/commands/deploy.ts
  - Plumbing for args; passes options.usePlan ⇒ source selection in resolveDependencies.

Environment notes
- docker-compose from launchql-extensions works. bootstrap-roles.sql ran; roles may pre-exist on repeated runs.
- docker exec /sql-bin/install.sh was not present; not required for this test.
- Test reproduced failure on fix/module-issue branch using:
  - yarn test:watch __tests__/cli-deploy-stage-unique-names.test.ts
