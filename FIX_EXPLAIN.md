Note: See FIX_NEEDED.md for the assessment of whether the local-tracking guard is necessary and its performance impact.
# Tag Resolution Fix — Deep Review (applies to PRs #218 and #219)

Summary
- Original bug: when dependency resolution returned an empty array for a change, LaunchQLMigrate.deploy fell back to raw plan dependencies, which can include unresolved tag tokens like `package:@tag`. Those tags leaked into the DB call to `launchql_migrate.deploy`, causing “Missing required changes …” errors.
- Failing CLI path: `lql deploy --recursive --database <db> --yes --no-usePlan --package unique-names` exercised the resolver in `sql` mode; for a change with no actual deps, it returned `[]`. Old code treated `[]` as “no value” and fell back to plan deps containing tags, passing those tags to the DB.
- Combined fix (#218 + #219): 
  - Trust resolver outputs even when empty (`resolvedFromDeps !== undefined`).
  - Qualify dependency names before DB call and dedupe.
  - Use a single chosen source (plan OR sql) based on caller intent; don’t merge sources.
  - Align tests with fixture semantics (notably tag references resolving to the correct change).

Original Problem
- Location: `packages/core/src/migrate/client.ts` (LaunchQLMigrate.deploy)
- Prior logic (problematic):
  - `const resolvedChangeDeps = (resolvedFromDeps && resolvedFromDeps.length > 0) ? resolvedFromDeps : change.dependencies;`
  - If resolver returned `[]`, code fell back to `change.dependencies` from the plan, which could contain unresolved tags (e.g., `launchql-ext-default-roles:@0.0.5`).
  - Those tags were then sent to `launchql_migrate.deploy`, which expects concrete change names, resulting in DB-level errors.
- Documentation of root cause: see <ref_file file="/home/ubuntu/repos/launchql/ISSUE.md" />

Why the CLI test failed
- Test: <ref_file file="/home/ubuntu/repos/launchql/packages/cli/__tests__/cli-deploy-stage-unique-names.test.ts" />
- Command path: `--no-usePlan` => dependency source is `sql` headers.
- For `unique-names`, resolver produced `[]` for the change’s key. Old fallback injected plan deps (with tags) into the DB call, causing “Missing required changes … : <tag tokens>”.

The Fix (what changed and why it works)
- Deploy logic change (current):
  - In <ref_snippet file="/home/ubuntu/repos/launchql/packages/core/src/migrate/client.ts" lines="172-183" />
    - Use resolver output whenever it’s defined, even if empty:  
      `const resolvedChangeDeps = (resolvedFromDeps !== undefined) ? resolvedFromDeps : change.dependencies;`
    - Qualify deps and dedupe before DB call:  
      `dep.includes(':') ? dep : \`\${plan.package}:\${dep}\`` then `Array.from(new Set(...))`
  - The DB call receives either a qualified, deduped list of `package:change` strings or `null` (no deps). Tags never get passed.
- Single-source resolution:
  - Source is chosen by caller and honored strictly:  
    <ref_snippet file="/home/ubuntu/repos/launchql/packages/core/src/migrate/client.ts" lines="135-141" />
    - `source: options.usePlan === false ? 'sql' : 'plan'`
  - No more implicit merging between plan and sql graphs. See <ref_file file="/home/ubuntu/repos/launchql/ATTEMPT2.md" /> for rationale.
- Tag resolution logic used elsewhere:
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/src/resolution/resolve.ts" />
  - `resolveTagToChangeName` maps `@tag` or `project:@tag` to a concrete change based on plan tags; `resolveDependencies` handles tagResolution for graphs.
- Tests updated and validated:
  - Tag fallback unit test: <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migrate/tag-fallback.test.ts" />
    - Ensures when resolver returns `[]`, DB call gets `null` deps (no tag leakage).
  - Tag-based migration expectations: <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migration/tag-based-migration.test.ts" />
    - Fixture semantics:  
      <ref_file file="/home/ubuntu/repos/launchql/__fixtures__/sqitch/simple-w-tags/packages/my-second/launchql.plan" />  
      `@v2.0.0` marks state after `create_table` (line 7), before `create_another_table`. So resolving `my-second:@v2.0.0` => `create_table`. Tests now reflect this.
  - Cross-project deps: <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migration/cross-project-dependencies.test.ts" />
    - Confirms qualification (`project-a:base_schema`, etc.) and dependent checks.

Answering the three review questions
1) Original problem: Empty-array dependency results were misinterpreted as “no value” and replaced with raw plan deps (which could contain unresolved tag tokens), letting tags reach `launchql_migrate.deploy`.
2) Why the original CLI test failed: With `--no-usePlan`, a change’s resolved deps were `[]`; the fallback re-inserted tag deps from plan into the DB call, which the DB rejected as missing required changes.
3) Why the fix is correct:
  - It trusts resolver outputs (including `[]`) and only falls back when the key is truly absent.
  - It always qualifies and dedupes dependency arrays before DB calls.
  - It avoids plan+sql graph merging and respects caller intent for source selection.
  - Tests cover tag fallback, tag-based migration behavior, and cross-project deps.

Edge cases and considerations
- If `resolveDependencies` truly lacks a key (undefined), fallback to `change.dependencies` still occurs. With `tagResolution: 'resolve'`, that fallback normally contains resolved change names; if there’s ever a tag in that path, it indicates a resolver/parsing issue that should be addressed at the source.
- Qualification logic assumes `:` is the delimiter for `package:change`, consistent with repo conventions.
- The deployed list remains unqualified (intentional) to match DB expectations and current tests; only dependency arrays are qualified.
- Source selection defaults:
  - Current code ties source to `usePlan` flag (plan by default, sql when explicitly `--no-usePlan`). This is consistent and documented in ATTEMPT2.md.

Recommendation
- Approve PR #219 (which targets #218’s branch). The fix precisely addresses the tag leakage, aligns tests with fixture semantics, and limits behavioral change to the safe, intended surface area.

Follow-ups (optional)
- Add a small test for “resolver missing key entirely” to ensure fallback still won’t pass tags (with tagResolution: 'resolve').
- Add a line of docs in README/DEPS.md clarifying how `--usePlan` / `--no-usePlan` determines source.
- Consider a warning log if fallback to plan deps happens due to a missing resolver key (helps future debugging).

Key references
- Code:  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/src/migrate/client.ts" />  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/src/resolution/resolve.ts" />  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/src/files/plan/parser.ts" />
- Tests:  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migrate/tag-fallback.test.ts" />  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migration/tag-based-migration.test.ts" />  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/core/__tests__/migration/cross-project-dependencies.test.ts" />  
  - <ref_file file="/home/ubuntu/repos/launchql/packages/cli/__tests__/cli-deploy-stage-unique-names.test.ts" />
- Fixtures:  
  - <ref_file file="/home/ubuntu/repos/launchql/__fixtures__/sqitch/simple-w-tags/packages/my-second/launchql.plan" />  
  - <ref_file file="/home/ubuntu/repos/launchql/__fixtures__/sqitch/simple-w-tags/packages/my-third/launchql.plan" />
- Docs:  
  - <ref_file file="/home/ubuntu/repos/launchql/ISSUE.md" />  
  - <ref_file file="/home/ubuntu/repos/launchql/ATTEMPT2.md" />
