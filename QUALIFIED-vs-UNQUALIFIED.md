# QUALIFIED vs UNQUALIFIED — Why only dependencies are qualified

Context
- Tag resolution fix ensures no tag tokens reach launchql_migrate.deploy.
- Two arrays exist during deploy logic:
  - dependencies (inputs to DB): what a change requires
  - deployed/skipped (local tracking): what we executed or skipped in this module

Key points
- We qualify dependencies only:
  - Dependencies can refer to other projects, so they must be fully disambiguated as package:change for the DB to resolve edges correctly across projects.
  - Qualification + dedup guarantees DB receives concrete change names, never tags, and no duplicates.
- We keep deployed/skipped unqualified:
  - These reflect local change names within the current package context. Adding package: prefixes is redundant and noisy for local bookkeeping.
  - Unqualified here preserves existing behavior and expectations in tests, logs, and error messages for per-module operations.

Why this matters for tag resolution
- The bug was tag leakage into the DB call. The fix isolates DB inputs:
  - dependencies array is the only path into the DB for “what must be present”; it is qualified and deduped, and built from the resolver’s output (including empty arrays) without falling back to raw tag tokens.
  - deployed/skipped do not affect dependency resolution or DB validation; they are just local status lists. Their qualification status does not impact tag resolution.
- Net effect:
  - Tag resolution correctness hinges on what we pass to the DB. By qualifying dependencies and trusting the resolver (even when []), we prevent tags from ever being sent. Keeping deployed/skipped unqualified does not reintroduce tag tokens.

Summary
- Qualify and dedupe: dependencies → required for cross-project clarity and to prevent tag leakage.
- Keep local lists simple: deployed/skipped remain unqualified → they don’t influence DB dependency checks and remain readable/consistent.
