PG authentication, teardown gating, and test stability

Overview
This document explains the intermittent Postgres protocol error 08P01 (expected password response, got message type 88/‘X’ Terminate) we observed during parallel tests, the fixes implemented in packages/pgsql-test, and guidance for correct usage with related utilities (pg-cache and teardownPgPools). It also outlines best practices to avoid regressions.

Problem summary
- Symptom: Random CI/local failures with error code 08P01 during authentication: server expects password but receives a Terminate packet.
- Root cause: A race between new client connections starting authentication and test teardown closing pools and dropping the database. If teardown terminates sockets or drops the DB mid-handshake, the server sees a protocol mismatch and raises 08P01.

What changed in pgsql-test
- Teardown gating in PgTestConnector
  - A shuttingDown flag blocks creation of new clients after teardown begins.
  - All in-flight client connect() promises are tracked (pendingConnects).
  - closeAll() now:
    - begins teardown (sets shuttingDown = true),
    - awaits pending connect handshakes to settle,
    - closes clients, disposes pools, and drops tracked databases,
    - resets state at the end (clears pendingConnects, sets shuttingDown = false) so subsequent tests can create clients again.
- Client lifecycle hardening
  - PgTestClient now stores its connect promise and close() awaits the handshake before ending the connection to avoid sending Terminate mid-auth.
- Teardown sequence
  - getConnections() teardown calls manager.beginTeardown() before teardownPgPools() and manager.closeAll() so gating is active as soon as teardown starts.

Why this fixes 08P01
- The failure mode required a new auth handshake to overlap with teardown. Gating prevents new handshakes once teardown starts.
- Awaiting pending connects ensures any already-started handshakes finish before we end pools or drop databases.
- Await-before-end in PgTestClient.close() avoids “Terminate during auth” on the client side.

About “cannot create client while shutting down”
- This error is expected if code tries to create clients during teardown. That’s precisely the unsafe window we’re protecting against.
- After closeAll() completes, PgTestConnector resets shuttingDown=false, so subsequent beforeEach/beforeAll can create clients normally.
- Seeing this error outside of teardown indicates a test or helper is racing teardown; the call site should be moved earlier (e.g., into beforeAll) or delayed until after teardown completes in the next test cycle.

Interaction with pg-cache
- pgsql-test itself does not rely on pg-cache for connection gating. However, some tests and utilities use teardownPgPools from pg-cache to ensure pools are closed.
- Using teardownPgPools remains valid and is part of the recommended teardown sequence. In pgsql-test, we call manager.beginTeardown() first, then teardownPgPools(), and finally manager.closeAll()—this ensures no new clients can be created while pools are shutting down.

Guidance for using teardownPgPools
- Always initiate teardown gating (manager.beginTeardown()) before calling teardownPgPools() if you are orchestrating teardown yourself. In pgsql-test’s standard flow, connect.ts does this for you.
- Avoid creating new Pool or Client instances in afterAll/afterEach; if you must perform final queries, perform them before starting teardown.
- If you maintain custom pools, make sure they are ended exactly once and do not auto-recreate after teardown begins.

Audit notes on current usages
- getConnections() pattern in pgsql-test and graphile-test wraps setup/teardown consistently and now engages gating at teardown start.
- Tests that manually use pg-cache and teardownPgPools should follow the sequence:
  1) beginTeardown()
  2) teardownPgPools()
  3) closeAll()
- The “cannot create client while shutting down” error would indicate a call to getConnections() or new client creation during teardown; after the recent fix, CI showed this only when the gate wasn’t reset—now resolved by resetting after cleanup.

Best practices and recommendations
- Keep client creation in beforeAll/beforeEach and teardown in afterAll/afterEach; do not mix creation inside teardown blocks.
- Do not open new connections once teardown begins. If a test needs extra work at the end, finish it before teardown starts.
- If reusing pools, be sure they do not spawn new clients after teardown begins.
- Prefer the provided getConnections() helper which handles gating and teardown sequence for you.

Troubleshooting checklist
- Seeing 08P01 again?
  - Check if any code opens a client after teardown begins.
  - Ensure closeAll() is awaited before starting the next test’s setup in your custom fixtures.
- Seeing “PgTestConnector is shutting down; no new clients allowed”?
  - Confirm the call is not inside or racing with afterAll/teardown.
  - If it happens at the next test’s beforeEach, ensure the previous teardown finished (await promises).
- Pool leaks or double-end warnings?
  - Ensure teardownPgPools() and closeAll() are each called once per test environment.
  - Verify no background process is constructing pools after teardown starts.

Possible future improvements
- Optional config flag to disable gating or increase safety delays for special scenarios.
- Docs/examples showing custom fixtures that combine pg-cache with PgTestConnector gating explicitly.
- Additional diagnostics around who attempts to create clients during teardown (stack traces guarded by a debug flag).

Conclusion
With teardown gating, pending connect tracking, and orderly close semantics, the intermittent 08P01 authentication protocol errors are resolved. The system now blocks unsafe new connections during teardown, waits for in-flight handshakes, and resets state so subsequent tests proceed normally. Follow the guidance above when using pg-cache and teardownPgPools to maintain stability.
