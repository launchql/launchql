# @launchql/appdirs

Simple, clean application directory resolution for Node.js applications.

## Installation

```bash
npm install @launchql/appdirs
# or
pnpm add @launchql/appdirs
```

## Features

- **Simple API**: Just one function to get all your app directories
- **Clean structure**: `~/.<tool>/{config,cache,data,logs}` + `/tmp/<tool>`
- **Graceful fallback**: XDG directories → tmp if home fails
- **No throws**: Always returns valid paths, never throws errors
- **TypeScript**: Full type definitions included
- **Zero dependencies**: Pure Node.js implementation

## Usage

### Basic Usage

```typescript
import { appdirs } from '@launchql/appdirs';

// Get directories for your tool
const dirs = appdirs('pgpm');

console.log(dirs.config); // ~/.pgpm/config
console.log(dirs.cache);  // ~/.pgpm/cache
console.log(dirs.data);   // ~/.pgpm/data
console.log(dirs.logs);   // ~/.pgpm/logs
console.log(dirs.tmp);    // /tmp/pgpm
```

### Create Directories

```typescript
import { appdirs } from '@launchql/appdirs';

// Get directories and create them
const dirs = appdirs('pgpm', { ensure: true });

// All directories now exist
// dirs.usedFallback will be true if XDG or tmp fallback was used
```

### Resolve Paths

```typescript
import { appdirs, resolve } from '@launchql/appdirs';

const dirs = appdirs('pgpm');

// Resolve paths within directories
const configFile = resolve(dirs, 'config', 'settings.json');
// Returns: ~/.pgpm/config/settings.json

const cacheDir = resolve(dirs, 'cache', 'repos', 'my-repo');
// Returns: ~/.pgpm/cache/repos/my-repo
```

### Manual Ensure

```typescript
import { appdirs, ensure } from '@launchql/appdirs';

const dirs = appdirs('pgpm');

// Create directories later
const result = ensure(dirs);

console.log(result.created);      // ['~/.pgpm', '~/.pgpm/config', ...]
console.log(result.usedFallback); // false (or true if fallback was used)
```

## API

### `appdirs(tool, options?)`

Get application directories for a tool.

**Parameters:**
- `tool` (string): Tool name (e.g., 'pgpm', 'lql')
- `options` (object, optional):
  - `baseDir` (string): Base directory (defaults to `os.homedir()`)
  - `useXdgFallback` (boolean): Use XDG fallback if home fails (default: `true`)
  - `ensure` (boolean): Automatically create directories (default: `false`)
  - `tmpRoot` (string): Root for temp directory (defaults to `os.tmpdir()`)

**Returns:** `AppDirsResult`
```typescript
{
  root: string;        // ~/.<tool>
  config: string;      // ~/.<tool>/config
  cache: string;       // ~/.<tool>/cache
  data: string;        // ~/.<tool>/data
  logs: string;        // ~/.<tool>/logs
  tmp: string;         // /tmp/<tool>
  usedFallback?: boolean; // true if XDG or tmp fallback was used
}
```

### `ensure(dirs)`

Create directories if they don't exist. Never throws.

**Parameters:**
- `dirs` (AppDirsResult): Directory paths from `appdirs()`

**Returns:** `EnsureResult`
```typescript
{
  created: string[];     // Directories that were created
  usedFallback: boolean; // true if XDG or tmp fallback was used
}
```

### `resolve(dirs, kind, ...parts)`

Resolve a path within a specific directory.

**Parameters:**
- `dirs` (AppDirsResult): Directory paths from `appdirs()`
- `kind` ('config' | 'cache' | 'data' | 'logs' | 'tmp'): Directory kind
- `parts` (string[]): Path parts to join

**Returns:** `string` - Resolved path

## Directory Structure

### Primary (POSIX-style)

```
~/.<tool>/
  ├── config/    # Configuration files
  ├── cache/     # Cached data
  ├── data/      # Application data
  └── logs/      # Log files

/tmp/<tool>/     # Temporary files
```

### Fallback (XDG)

If home directory is unavailable or creation fails, falls back to XDG:

```
~/.config/<tool>/           # Config
~/.cache/<tool>/            # Cache
~/.local/share/<tool>/      # Data
~/.local/state/<tool>/logs/ # Logs
```

### Final Fallback (tmp)

If XDG also fails, falls back to system temp:

```
/tmp/<tool>/
  ├── config/
  ├── cache/
  ├── data/
  └── logs/
```

## Examples

### Configuration File

```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import fs from 'fs';

const dirs = appdirs('myapp', { ensure: true });
const configPath = resolve(dirs, 'config', 'settings.json');

// Write config
fs.writeFileSync(configPath, JSON.stringify({ theme: 'dark' }));

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
```

### Cache Management

```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import fs from 'fs';

const dirs = appdirs('myapp', { ensure: true });
const cacheFile = resolve(dirs, 'cache', 'data.json');

// Check if cached
if (fs.existsSync(cacheFile)) {
  const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  console.log('Using cached data:', cached);
} else {
  // Fetch and cache
  const data = await fetchData();
  fs.writeFileSync(cacheFile, JSON.stringify(data));
}
```

### Logging

```typescript
import { appdirs, resolve } from '@launchql/appdirs';
import fs from 'fs';

const dirs = appdirs('myapp', { ensure: true });
const logFile = resolve(dirs, 'logs', 'app.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

log('Application started');
```

### Custom Base Directory

```typescript
import { appdirs } from '@launchql/appdirs';

// Use a custom base directory
const dirs = appdirs('myapp', {
  baseDir: '/opt/myapp',
  ensure: true
});

console.log(dirs.config); // /opt/myapp/.myapp/config
```

## Design Philosophy

- **Simple**: One function, clear structure
- **Clean**: No pollution of exports, minimal API surface
- **Graceful**: Never throws, always returns valid paths
- **Fallback**: XDG only as absolute fallback, not primary
- **Focused**: Just directory resolution, no state management

## Comparison with PgpmHome

`@launchql/appdirs` is a simpler, cleaner replacement for the previous `PgpmHome` approach:

**Before (PgpmHome):**
- Class-based API with state management
- Mixed concerns (directories + JSON state)
- Complex config precedence system

**After (appdirs):**
- Function-based API for directory resolution
- Single concern: just paths
- Simple, clean, reusable

## License

MIT

## Contributing

See the main [LaunchQL repository](https://github.com/launchql/launchql) for contribution guidelines.
