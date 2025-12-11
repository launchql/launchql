# pg-env

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

PostgreSQL environment configuration utilities for managing database connection settings.

## Installation

```bash
npm install pg-env
```

## Features

- Parse PostgreSQL environment variables (PGHOST, PGPORT, etc.)
- Convert configuration objects to environment variables
- Merge environment variables with configuration overrides
- Create spawn environments with PostgreSQL settings

## Usage

### Basic Configuration

```typescript
import { PgConfig, getPgEnvOptions } from 'pg-env';

// Get PostgreSQL config from environment with defaults
const config = getPgEnvOptions();
console.log(config);
// { host: 'localhost', port: 5432, user: 'postgres', ... }

// Override specific values
const customConfig = getPgEnvOptions({
  database: 'myapp',
  port: 5433
});
```

### Environment Variables

```typescript
import { getPgEnvVars, toPgEnvVars } from 'pg-env';

// Read current PostgreSQL environment variables
const envVars = getPgEnvVars();
// Returns partial PgConfig from PGHOST, PGPORT, etc.

// Convert config to environment variables
const config: PgConfig = {
  host: 'db.example.com',
  port: 5432,
  user: 'appuser',
  password: 'secret',
  database: 'myapp'
};

const envVars = toPgEnvVars(config);
// { PGHOST: 'db.example.com', PGPORT: '5432', ... }
```

### Spawning Processes

```typescript
import { getSpawnEnvWithPg } from 'pg-env';
import { spawn } from 'child_process';

// Create environment for spawning processes
const env = getSpawnEnvWithPg({
  database: 'testdb',
  user: 'testuser'
});

// Use with child processes
const child = spawn('psql', [], { env });
```

## API

### Types

#### `PgConfig`

```typescript
interface PgConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
```

### Functions

- `getPgEnvOptions(overrides?: Partial<PgConfig>): PgConfig` - Get config from environment with overrides
- `getPgEnvVars(): Partial<PgConfig>` - Parse PostgreSQL environment variables
- `toPgEnvVars(config: Partial<PgConfig>): Record<string, string>` - Convert config to env vars
- `getSpawnEnvWithPg(config: Partial<PgConfig>, baseEnv?: NodeJS.ProcessEnv): NodeJS.ProcessEnv` - Create spawn environment

### Constants

- `defaultPgConfig: PgConfig` - Default PostgreSQL configuration

## Environment Variables

The package reads the following environment variables:

- `PGHOST` - Database host
- `PGPORT` - Database port (parsed as number)
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name
