# PGPM Environment & State: Usage Scenarios

## Overview

The `resolvePgpmEnv` function resolves configuration from multiple sources with clear precedence: **CLI flags → env vars → project config → user config → defaults**. It returns directories (configDir, cacheDir, stateDir), merged options, and a noGlobalConfig flag.

**Supported config formats:** `.js`, `.cjs`, `.json` (native TS/JS only)

**Key directories:**
- `configDir`: `~/.config/pgpm` (user/global config)
- `cacheDir`: `~/.cache/pgpm` (persistent cache)
- `stateDir`: `~/.pgpm` (CLI state storage)

## Scenario 1: Personal Dev Config vs Repo Authorship

**Problem:** You're developing this repo and have personal settings in `~/.config/pgpm/config.json` that you don't want affecting the repo's behavior or leaking into commits.

**Solution:** Use env vars to separate your personal dev environment from repo authorship:

```bash
# Ignore your personal global config entirely
alias pgpm-dev='PGPM_NO_GLOBAL_CONFIG=1 node path/to/cli.js'

# Or use a separate dev config directory
alias pgpm-dev='PGPM_CONFIG_DIR=~/.config/pgpm-dev node path/to/cli.js'
```

**Key insight:** Project config (in the repo) has higher precedence than user config. So even with your personal config, the repo's `pgpm.config.json` will override it. Your personal settings won't leak into the repo unless the project config explicitly opts in.

## Scenario 2: Cached Repo Cloning with LRU & Fallback

**Problem:** You want to cache cloned repositories with TTL/LRU eviction, but gracefully fallback to temp directories on filesystem errors.

**Pattern using existing API:**

```typescript
import { resolvePgpmEnv } from '@launchql/env';
import { PgpmHome } from '@launchql/core';

const resolved = resolvePgpmEnv();
const cacheRoot = resolved.cacheDir; // ~/.cache/pgpm

// 1. Compute cache key
const key = hash(repoUrl + branch + version);
const cachePath = path.join(cacheRoot, 'repos', key);

// 2. Check TTL (via mtime or metadata file)
const metadata = { lastAccess: Date.now(), ttlMs: 7 * 24 * 60 * 60 * 1000 };
const age = Date.now() - fs.statSync(cachePath).mtimeMs;

// 3. Hit: return cached
if (fs.existsSync(cachePath) && age < metadata.ttlMs) {
  return { path: cachePath, ephemeral: false };
}

// 4. Miss: populate cache (or fallback on error)
try {
  await gitClone(repoUrl, cachePath);
  return { path: cachePath, ephemeral: false };
} catch (err) {
  // Filesystem error: fallback to system temp
  const tmpPath = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-'));
  await gitClone(repoUrl, tmpPath);
  return { path: tmpPath, ephemeral: true }; // Caller should delete
}
```

**Key points:**
- Use `cacheDir` as the root for persistent cache
- Store metadata (lastAccess, ttlMs) in `.cache.json` or use directory mtime
- On EACCES/IO errors, fallback to `os.tmpdir()` and mark `ephemeral: true`
- Callers delete ephemeral paths after use; cached paths persist

## Scenario 3: Template Cloning API Design

**Problem:** Should the system automatically cache template repos when users clone them? Or should cloning be separate from the config/state API?

**Recommendation:** Keep cloning/copying **outside** of PgpmHome/env packages.

**Why:**
- PgpmHome/env are pure "resolution/state" utilities (directories, config, simple key-value state)
- Baking git clone/network operations into them conflates concerns
- Creates a bad API for developers building boilerplate features

**Better approach:** Create a separate `RepoCache` or `CacheManager` interface:

```typescript
interface RepoCache {
  ensureCache(
    key: string,
    options: { ttlMs: number },
    populateFn: (targetPath: string) => Promise<void>
  ): Promise<{ path: string; source: 'cache' | 'created' | 'temp'; ephemeral: boolean }>;
}
```

**Benefits:**
- Black-box API: caller provides `populateFn` (git clone, copy, template expand)
- No network/git concerns in env/core packages
- Testable: mock `populateFn` in tests
- Flexible: works for repos, templates, any cached artifacts

## Settings by Scenario

**Local development (ignore personal config):**
```bash
PGPM_NO_GLOBAL_CONFIG=1 lql deploy
```

**Local development (separate dev config):**
```bash
PGPM_CONFIG_DIR=~/.config/pgpm-dev lql deploy
```

**CI/CD (no user config, project config only):**
```bash
PGPM_NO_GLOBAL_CONFIG=1 lql test
```

**Shared runners (custom cache location):**
```bash
PGPM_CACHE_DIR=/shared/cache/pgpm lql build
```

**Offline/air-gapped (disable network-dependent features):**
```bash
PGPM_NO_GLOBAL_CONFIG=1 PGPM_CACHE_DIR=/local/cache lql deploy
```

**Ephemeral-only (no persistent state):**
```bash
PGPM_STATE_DIR=/tmp/pgpm-state-$$ lql init
# State deleted when shell exits
```

## Config File Locations

**User/global config (lowest precedence):**
- `~/.config/pgpm/config.json`
- `~/.config/pgpm/config.js`
- `~/.config/pgpm/config.cjs`

**Project config (higher precedence):**
- `./pgpm.config.json`
- `./pgpm.config.js`
- `./pgpm.config.cjs`
- `./pgpm.json`

**Env vars (higher precedence):**
- `PGPM_CONFIG_DIR`
- `PGPM_CACHE_DIR`
- `PGPM_STATE_DIR`
- `PGPM_NO_GLOBAL_CONFIG=1`

**CLI flags (highest precedence, when wired):**
- `--config-dir=/path`
- `--cache-dir=/path`
- `--state-dir=/path`
- `--no-global-config`

## Notes

- CLI flags are passed via `resolvePgpmEnv({ flags })` today; CLI package wiring may vary
- `resolvePgpmEnv` currently lacks tests; consider adding precedence tests in a follow-up
- For more details on state directory, see [PGPM_HOME.md](../core/src/utils/PGPM_HOME.md)
