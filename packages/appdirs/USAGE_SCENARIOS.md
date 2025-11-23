# appdirs: Usage Scenarios

## Overview

`appdirs` provides simple directory resolution for CLI tools. It returns paths for config, cache, data, logs, and tmp directories with graceful fallback handling.

**Key directories:**
- `~/.<tool>/config` - Configuration files
- `~/.<tool>/cache` - Persistent cache
- `~/.<tool>/data` - Application data
- `~/.<tool>/logs` - Log files
- `/tmp/<tool>` - Temporary files

**Fallback chain:** Home directory → XDG directories → System temp

## Scenario 1: Personal Dev Config vs Repo Authorship

**Problem:** You're developing a CLI tool and have personal settings in `~/.pgpm/` that you don't want affecting the repo's behavior or tests.

**Solution:** Use custom `baseDir` to separate your dev environment:

```typescript
import { appdirs } from '@launchql/appdirs';
import * as os from 'os';
import * as path from 'path';

// Production: uses ~/.pgpm/
const prodDirs = appdirs('pgpm');

// Development: uses /tmp/pgpm-dev-<random>/
const devDirs = appdirs('pgpm', {
  baseDir: path.join(os.tmpdir(), 'pgpm-dev-' + Date.now()),
  ensure: true
});

// Tests: uses custom test directory
const testDirs = appdirs('pgpm', {
  baseDir: '/tmp/pgpm-test',
  tmpRoot: '/tmp/pgpm-test-tmp',
  ensure: true
});
```

**Key insight:** By using `baseDir`, you can completely isolate different environments without env vars or complex config precedence.

## Scenario 2: Cached Repo Cloning with TTL & Fallback

**Problem:** Cache cloned repositories with TTL/LRU eviction, gracefully fallback to temp on filesystem errors.

**Pattern using appdirs:**

```typescript
import { appdirs, resolve, ensure } from '@launchql/appdirs';
import * as fs from 'fs';
import * as path from 'path';

const dirs = appdirs('pgpm', { ensure: true });

async function getCachedRepo(repoUrl: string, branch: string) {
  const key = hash(repoUrl + branch);
  const cachePath = resolve(dirs, 'cache', 'repos', key);
  
  // Check TTL (via mtime or metadata)
  const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  if (fs.existsSync(cachePath)) {
    const age = Date.now() - fs.statSync(cachePath).mtimeMs;
    if (age < ttlMs) {
      return { path: cachePath, ephemeral: false };
    }
  }
  
  // Populate cache (or fallback on error)
  try {
    await gitClone(repoUrl, cachePath);
    return { path: cachePath, ephemeral: false };
  } catch (err) {
    // Filesystem error: fallback to tmp
    const tmpPath = resolve(dirs, 'tmp', 'repos', key);
    fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
    await gitClone(repoUrl, tmpPath);
    return { path: tmpPath, ephemeral: true }; // Caller should delete
  }
}
```

**Key points:**
- Use `resolve(dirs, 'cache', ...)` for persistent cache
- Use `resolve(dirs, 'tmp', ...)` for ephemeral fallback
- Mark ephemeral paths so callers know to delete them
- Store metadata in `.cache.json` or use directory mtime

## Scenario 3: Template Cloning API Design

**Problem:** Should the system automatically cache template repos when users clone them?

**Recommendation:** Keep cloning/copying separate from appdirs.

**Why:**
- `appdirs` is pure directory resolution (no network/git operations)
- Baking git clone into it conflates concerns
- Creates a bad API for developers building features

**Better approach:** Create a separate `RepoCache` interface that uses appdirs:

```typescript
import { appdirs, resolve } from '@launchql/appdirs';

interface RepoCache {
  ensureCache(
    key: string,
    options: { ttlMs: number },
    populateFn: (targetPath: string) => Promise<void>
  ): Promise<{ path: string; source: 'cache' | 'created' | 'temp'; ephemeral: boolean }>;
}

class RepoCacheImpl implements RepoCache {
  private dirs = appdirs('pgpm', { ensure: true });
  
  async ensureCache(key: string, options: { ttlMs: number }, populateFn: (path: string) => Promise<void>) {
    const cachePath = resolve(this.dirs, 'cache', 'repos', key);
    
    // Check cache + TTL
    if (fs.existsSync(cachePath)) {
      const age = Date.now() - fs.statSync(cachePath).mtimeMs;
      if (age < options.ttlMs) {
        return { path: cachePath, source: 'cache', ephemeral: false };
      }
    }
    
    // Populate cache or fallback
    try {
      await populateFn(cachePath);
      return { path: cachePath, source: 'created', ephemeral: false };
    } catch (err) {
      const tmpPath = resolve(this.dirs, 'tmp', 'repos', key);
      await populateFn(tmpPath);
      return { path: tmpPath, source: 'temp', ephemeral: true };
    }
  }
}
```

**Benefits:**
- Black-box API: caller provides `populateFn` (git clone, copy, template expand)
- No network/git concerns in appdirs
- Testable: mock `populateFn` in tests
- Flexible: works for repos, templates, any cached artifacts

## Common Patterns

**Configuration file:**
```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import * as fs from 'fs';

const dirs = appdirs('pgpm', { ensure: true });
const configFile = resolve(dirs, 'config', 'settings.json');

// Write config
fs.writeFileSync(configFile, JSON.stringify({ theme: 'dark' }));

// Read config
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
```

**Logging:**
```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import * as fs from 'fs';

const dirs = appdirs('pgpm', { ensure: true });
const logFile = resolve(dirs, 'logs', 'app.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}
```

**Ephemeral temp files:**
```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import * as fs from 'fs';

const dirs = appdirs('pgpm');
const tmpFile = resolve(dirs, 'tmp', 'work', 'temp.txt');

fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
fs.writeFileSync(tmpFile, 'temporary data');

// Clean up when done
fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
```

## Settings by Scenario

**Local development (isolated from personal config):**
```typescript
const dirs = appdirs('pgpm', {
  baseDir: '/tmp/pgpm-dev',
  ensure: true
});
```

**CI/CD (ephemeral, no persistence):**
```typescript
const dirs = appdirs('pgpm', {
  baseDir: '/tmp/ci-pgpm-' + process.env.CI_JOB_ID,
  tmpRoot: '/tmp/ci-tmp',
  ensure: true
});
```

**Shared runners (custom cache location):**
```typescript
const dirs = appdirs('pgpm', {
  baseDir: '/shared/pgpm',
  ensure: true
});
```

**Testing (isolated per test):**
```typescript
beforeEach(() => {
  testDirs = appdirs('pgpm', {
    baseDir: fs.mkdtempSync(path.join(os.tmpdir(), 'test-')),
    ensure: true
  });
});

afterEach(() => {
  fs.rmSync(testDirs.root, { recursive: true, force: true });
});
```

## Notes

- `appdirs` never throws - always returns valid paths
- Use `ensure: true` option or `ensure(dirs)` function to create directories
- Tmp directory is never auto-created (caller manages lifecycle)
- XDG fallback only triggers if home directory fails
- For graceful degradation, check `dirs.usedFallback` flag
