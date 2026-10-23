---
name: pgsql-test-exceptions
description: Assert that a statement fails without poisoning the test transaction — use db.expectError() from pgsql-test. Use when testing RLS policy violations, constraint errors, permission denied errors, raised application errors, or any expected database exception. Essential for security testing.
compatibility: Node.js 18+, pgsql-test package, PostgreSQL
metadata:
  author: constructive-io
  version: "2.0.0"
---

# Testing Exceptions: `db.expectError()`

**Use `db.expectError()` for every statement that is supposed to fail.** Do not
write your own `expectRejects` / `expectRefused` / `expectRaise` helper, and do
not hand-roll `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` around `expect(...).rejects`.
The helper already exists on every `PgTestClient` (`pg`, `db`, and the clients
handed out by `supabase-test`, `drizzle-orm-test`, `graphile-test`, …).

## The Problem It Solves

When a statement fails inside a transaction, PostgreSQL aborts the whole
transaction. Every test runs inside one (`db.beforeEach()`), so after a naive
`await expect(db.query(...)).rejects.toThrow()` the next query fails with:

```
current transaction is aborted, commands ignored until end of transaction block
```

## Usage

```typescript
it('users cannot insert pets for other users', async () => {
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': bob });

  await db.expectError(
    () => db.query(`INSERT INTO pets (name, owner_id) VALUES ('Fake', $1)`, [alice]),
    /violates row-level security/
  );

  // The transaction is still usable — verify the attack had no effect
  const count = await db.one(`SELECT count(*) FROM pets WHERE owner_id = $1`, [alice]);
  expect(Number(count.count)).toBe(2);
});
```

### Signature

```typescript
db.expectError<E = any>(
  run: () => Promise<unknown>,
  expected?: string | RegExp | { code?: string; message?: string | RegExp }
): Promise<E>  // resolves to the caught error
```

| `expected` | Matches when |
|---|---|
| omitted | `run` throws anything |
| `'duplicate key'` | the error message contains the string |
| `/permission denied/` | the regex matches the error message |
| `{ code: '42501' }` | the SQLSTATE (`err.code`) is exactly `42501` |
| `{ code: '23505', message: /email/ }` | both match |

It **throws** (failing the test) when `run` succeeds or the error does not match,
with the expected matcher and the actual `code: message` in the failure.
It **resolves** to the caught error, so you can assert on more fields:

```typescript
const err = await db.expectError(() => db.query(`SELECT app.transfer($1)`, [-5]));
expect(err.code).toBe('P0001');
expect(err.message).toMatch(/^INVALID_AMOUNT/);
```

### What It Does

1. `SAVEPOINT` on this client
2. runs `run()`
3. `ROLLBACK TO SAVEPOINT` — **always**, in a `finally`, so the aborted state is
   cleared even when the assertion fails, and an unexpected success leaves no rows
4. `RELEASE SAVEPOINT`, so the call nets out to nothing and can be repeated or
   nested freely

## Common Scenarios

### RLS Policy Violations

```typescript
it('users cannot hand their item to another user', async () => {
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': bob });
  await db.expectError(
    () => db.query(`UPDATE items SET owner_id = $1 WHERE owner_id = $2`, [alice, bob]),
    /violates row-level security/ // WITH CHECK rejects the new row
  );

  const item = await db.one(`SELECT owner_id FROM items WHERE name = 'bobs'`);
  expect(item.owner_id).toBe(bob);
});
```

> An `UPDATE`/`DELETE` that RLS filters to zero rows does **not** error — it
> affects 0 rows. Assert `rowCount === 0` for those; use `expectError` only when
> the policy raises (`WITH CHECK` on `INSERT`/`UPDATE`, or a permission error).

### Permission Denied — Several In A Row

```typescript
it('anonymous users cannot modify data', async () => {
  db.setContext({ role: 'anonymous' });

  await db.expectError(() => db.query(`INSERT INTO users (name) VALUES ('hacker')`), /permission denied/);
  await db.expectError(() => db.query(`UPDATE users SET name = 'hacked'`), /permission denied/);
  await db.expectError(() => db.query(`DELETE FROM users`), /permission denied/);
});
```

### Constraint Violations (match by SQLSTATE)

```typescript
it('rejects duplicate emails', async () => {
  await db.query(`INSERT INTO users (email) VALUES ('test@example.com')`);

  await db.expectError(
    () => db.query(`INSERT INTO users (email) VALUES ('test@example.com')`),
    { code: '23505' } // unique_violation
  );

  const count = await db.one(`SELECT count(*) FROM users`);
  expect(Number(count.count)).toBe(1);
});
```

### PL/pgSQL Raised Errors

```typescript
it('rejects NULL query', async () => {
  await db.expectError(() => db.any(`SELECT my_function(NULL)`), 'query cannot be NULL');
});
```

### A Shared Call With Fixed Arguments

Wrap the *call*, not the savepoint logic:

```typescript
const record = (client: PgTestClient, rows: unknown[]) =>
  client.query(`SELECT app.record($1::jsonb)`, [JSON.stringify(rows)]);

await db.expectError(() => record(db, [bad]), /FORBIDDEN/);
await pg.expectError(() => record(pg, [{ count: 0 }]), /count_chk/);
```

## Rules

1. **Call `expectError` on the client that runs the statement.** `db.expectError(() => db.query(...))`,
   `pg.expectError(() => pg.query(...))`. A savepoint on `db` cannot rescue an
   aborted transaction on `pg` — they are separate connections.
2. **Never hand-roll it.** No local `expectRejects`/`expectRefused`/`expectRaise`
   helpers, no `pg.query('SAVEPOINT ...')` / `ROLLBACK TO SAVEPOINT` strings, no
   `db.savepoint()` → `expect().rejects` → `db.rollback()` triples.
3. **Match something specific.** Prefer a SQLSTATE `{ code }` or the error code
   your function raises over a bare `expectError(fn)`, so the test cannot pass on
   an unrelated failure (a typo, a missing grant).
4. **Verify state afterwards.** The point of keeping the transaction alive is to
   prove the rejected operation had no effect.

## When You Still Need `savepoint()` / `rollback()`

Only for multi-statement scenarios that are *not* "this should fail" — e.g.
trying an operation and then undoing it on purpose. `db.savepoint(name)` and
`db.rollback(name)` remain available; a name can be reused, and
`ROLLBACK TO SAVEPOINT` keeps the savepoint, so you can roll back to it again.

## References

- Related: [pgsql-test-rls.md](./pgsql-test-rls.md) for RLS testing
- Related skill: `pgpm` (`references/testing.md`) for general test setup
