Title: Is the local-tracking guard necessary? Performance and assumptions

Summary
- The guard ensures deployed/skipped track only local change names:
  - Accepts unqualified names.
  - If qualified, allows only when pkg === plan.package and strips the prefix; otherwise throws.
- Impact on tag resolution: None at runtime for DB inputs. Tag resolution correctness hinges on dependency arrays, which are already qualified/deduped and sourced from the resolver. The guard is a defense-in-depth check for local bookkeeping, not the tag fix itself.

Do we need this guard?
- Arguments against necessity:
  - Normal flow already constructs the changes list from the current package’s plan; cross-package names should not appear in deployed/skipped.
  - Tests pass without the guard because resolver/plan parsing keep “change.name” local.
- Arguments for keeping it:
  - Defense-in-depth: Prevents accidental cross-package names in local arrays if future refactors introduce mixing or if external callers feed qualified names.
  - Symmetry/readability: Makes intent explicit that deployed/skipped are per-package, unqualified.
  - Fail-fast: Throws early with a clear error instead of silently recording incorrect state that could mislead logs, tests, or analytics.

Performance considerations
- Cost per change is negligible:
  - One string.includes(':') check and one split (worst-case) when pushing to deployed/skipped.
  - O(1) additional work per change vs. network/IO-bound DB operations.
  - No allocations beyond two short strings when needed.
- Expected overhead is orders of magnitude smaller than DB calls and file I/O. No measurable performance impact is expected.

Alternatives/Assumptions
- Rely on LaunchQLPackage to ensure change lists are local:
  - If LaunchQLMigrate is always used through LaunchQLPackage and guarantees only local changes are passed in, the guard is redundant but harmless.
  - If LaunchQLMigrate may be used directly (library consumers, tests, other tools), the guard adds safe validation for misuse.
- Documentation-only approach:
  - We could remove the guard and document the assumption that change.name is always local. Risk: future regressions won’t be caught early.

Recommendation
- Keep the guard:
  - It does not affect tag resolution mechanics nor performance in practice.
  - It clearly encodes the invariant that deployed/skipped are strictly local and unqualified.
  - It provides early, explicit failure if cross-package names are encountered, reducing debugging time.

Notes on scope
- The guard only affects local tracking arrays; dependency arrays used for DB calls remain fully qualified and deduped.
- The revert path applies the same rule to skipped tracking to maintain consistency.

Conclusion
- Not strictly required for the tag fix, but a low-cost, clear invariant check worth keeping. It improves robustness with no meaningful performance penalty and avoids subtle state pollution in logs/results if future changes accidentally pass cross-package names.
