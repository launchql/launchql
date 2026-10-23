
# PGPM Troubleshooting

Quick fixes for common pgpm, PostgreSQL, and testing issues.

## When to Apply

Use this skill when encountering:
- Connection errors to PostgreSQL
- Docker-related issues
- Environment variable problems
- Transaction aborted errors in tests
- Deployment failures

## PostgreSQL Connection Issues

### Docker Not Running

**Symptom:**
```text
Cannot connect to the Docker daemon
```

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully initialize
3. Then run pgpm commands

### PostgreSQL Not Accepting Connections

**Symptom:**
```text
psql: error: connection to server at "localhost" (127.0.0.1), port 5432 failed
```

**Solution:**
```bash
# Start PostgreSQL container
pgpm docker start

# Load environment variables
eval "$(pgpm env)"

# Verify connection
psql -c "SELECT version();"
```

### Wrong Port or Host

**Symptom:**
```text
connection refused
```

**Solution:**
```bash
# Check current environment
echo $PGHOST $PGPORT

# Reload environment
eval "$(pgpm env)"

# Verify settings
pgpm env
```

## Environment Variable Issues

### PGHOST Not Set

**Symptom:**
```text
PGHOST not set
```
or
```text
could not connect to server: No such file or directory
```

**Solution:**
```bash
# Load pgpm environment
eval "$(pgpm env)"
```

**Permanent fix** - add to shell config:
```bash
# Add to ~/.bashrc or ~/.zshrc
eval "$(pgpm env)"
```

### Environment Not Persisting

**Symptom:** Environment variables reset after each command

**Cause:** Running `eval $(pgpm env)` in a subshell or script

**Solution:** Run in current shell:
```bash
# Correct - runs in current shell
eval "$(pgpm env)"

# Wrong - runs in subshell
bash -c 'eval "$(pgpm env)"'
```

## Testing Issues

### Tests Fail to Connect

**Symptom:** Tests time out or fail with connection errors

**Solution:**
```bash
# 1. Start PostgreSQL
pgpm docker start

# 2. Load environment
eval "$(pgpm env)"

# 3. Bootstrap users (run once)
pgpm admin-users bootstrap --yes

# 4. Run tests
pnpm test
```

### Current Transaction Is Aborted

**Symptom:**
```text
current transaction is aborted, commands ignored until end of transaction block
```

**Cause:** An error occurred in the transaction, and PostgreSQL marks the entire transaction as aborted. All subsequent queries fail until the transaction ends.

**Solution:** Assert the failing statement with `db.expectError()` — it runs it inside a savepoint and rolls back to it, so the transaction stays usable:

```typescript
it('tests multiple failure scenarios', async () => {
  await db.expectError(() => db.query('INSERT INTO restricted_table ...'), /permission denied/);
  await db.expectError(() => db.query('INSERT INTO users (email) VALUES ($1)', [dup]), { code: '23505' });

  // The connection is still usable
  const result = await db.query('SELECT 1');
  expect(result.rows[0]).toBeDefined();
});
```

Call it on the client that runs the statement (`pg.expectError(() => pg.query(...))` for `pg`). Don't hand-roll `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` or write a local wrapper. See the `constructive-testing` skill's `references/pgsql-test-exceptions.md`.

### Tests Interfering with Each Other

**Symptom:** Tests pass individually but fail when run together

**Cause:** Missing or incorrect beforeEach/afterEach hooks

**Solution:**
```typescript
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});
```

## Deployment Issues

### Module Not Found

**Symptom:**
```text
Error: Module 'mymodule' not found
```

**Solution:**
1. Ensure you're in a pgpm workspace (has `pgpm.json`)
2. Check module is in `packages/` directory
3. Verify module has `.control` file

### Dependency Not Found

**Symptom:**
```text
Error: Change 'module:path/to/change' not found
```

**Solution:**
1. Check the referenced module exists
2. Verify the change path matches exactly
3. Check `-- requires:` comment syntax:
   ```sql
   -- requires: other_module:schemas/other/tables/table
   ```

### Deploy Order Wrong

**Symptom:** Foreign key or reference errors during deployment

**Solution:**
1. Check `pgpm.plan` for correct order
2. Verify `-- requires:` comments in deploy files
3. Regenerate plan if needed:
   ```bash
   pgpm plan
   ```

## Docker Issues

### Container Won't Start

**Symptom:**
```text
Error starting container
```

**Solution:**
```bash
# Stop any existing containers
pgpm docker stop

# Remove old containers
docker rm -f pgpm-postgres

# Start fresh
pgpm docker start
```

### Port Already in Use

**Symptom:**
```text
port 5432 is already in use
```

**Solution:** first find out whether it is already a PostgreSQL server:

```bash
pg_isready -h localhost -p 5432
```

If it answers, the developer runs their own Postgres — use it instead of Docker. Never
stop or kill it to free the port. Ask for (or use) superuser credentials and skip
`pgpm docker start`:

```bash
export PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=yourpassword
pgpm admin-users bootstrap --yes     # once: roles pgpm and pgsql-test expect
```

Do not run `eval "$(pgpm env)"` in this case — it emits the container's connection
vars and would overwrite yours.

If you want the pgpm container *alongside* an existing server, move it and match the port:

```bash
pgpm docker start --port 5433
export PGPORT=5433
```

Only if `lsof -i :5432` shows something that is not Postgres should you consider
stopping that process.

### Volume Permission Issues

**Symptom:**
```text
Permission denied on volume mount
```

**Solution:**
```bash
# Remove old volumes
docker volume rm pgpm_data

# Restart
pgpm docker start
```

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Can't connect | `pgpm docker start && eval "$(pgpm env)"` |
| PGHOST not set | `eval "$(pgpm env)"` |
| Transaction aborted | `db.expectError(() => db.query(...), /pattern/)` |
| Tests interfere | Check beforeEach/afterEach hooks |
| Module not found | Verify workspace structure |
| Port in use | `pg_isready -h localhost -p 5432` — if it's Postgres, use it (export PG*); else `pgpm docker start --port 5433` + `PGPORT=5433` |

## Getting Help

If issues persist:
1. Check pgpm version: `pgpm --version`
2. Check Docker status: `docker ps`
3. Check PostgreSQL logs: `docker logs pgpm-postgres`
4. Verify environment: `pgpm env`

## References

- Related reference: `references/docker.md` for Docker management
- Related reference: `references/env.md` for environment configuration
- Related skill: `pgsql-test-exceptions` for transaction handling
