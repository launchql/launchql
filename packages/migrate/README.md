# @launchql/migrate

A TypeScript-based database migration system for PostgreSQL that replaces Sqitch with a native implementation.

## Features

- **Native TypeScript**: No external dependencies on Sqitch
- **PostgreSQL-based state tracking**: All migration state is stored in the database
- **Dependency management**: Supports change dependencies
- **Verification support**: Built-in support for verify scripts
- **Import from Sqitch**: Can import existing Sqitch deployments
- **Drop-in replacement**: Compatible with existing Sqitch plan files

## Installation

```bash
npm install @launchql/migrate
```

## Usage

### As a Library

```typescript
import { LaunchQLMigrate } from '@launchql/migrate';

const migrate = new LaunchQLMigrate({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'postgres'
});

// Deploy changes
const deployResult = await migrate.deploy({
  project: 'myproject',
  targetDatabase: 'myapp',
  planPath: './launchql.plan',
  deployPath: './deploy',
  verifyPath: './verify'
});

// Revert changes
const revertResult = await migrate.revert({
  project: 'myproject',
  targetDatabase: 'myapp',
  planPath: './launchql.plan',
  revertPath: './revert'
});

// Verify deployment
const verifyResult = await migrate.verify({
  project: 'myproject',
  targetDatabase: 'myapp',
  planPath: './launchql.plan',
  verifyPath: './verify'
});

// Check status
const status = await migrate.status('myproject');

// Import from existing Sqitch deployment
await migrate.importFromSqitch();

// Don't forget to close the connection
await migrate.close();
```

### As a Drop-in Replacement for Sqitch

```typescript
import { deployCommand, revertCommand, verifyCommand } from '@launchql/migrate';

const config = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password'
};

// Replace spawn('sqitch', ['deploy', 'db:pg:mydb'])
await deployCommand(config, 'mydb', '/path/to/project');

// Replace spawn('sqitch', ['revert', 'db:pg:mydb'])
await revertCommand(config, 'mydb', '/path/to/project');

// Replace spawn('sqitch', ['verify', 'db:pg:mydb'])
await verifyCommand(config, 'mydb', '/path/to/project');
```

## Migration Schema

The migration system creates a `launchql_migrate` schema in your PostgreSQL database with the following tables:

- `projects`: Tracks migration projects
- `changes`: Records deployed changes with their script hashes
- `dependencies`: Tracks change dependencies
- `events`: Logs deployment events (deploy, revert, fail)

## Plan File Format

The system is compatible with Sqitch plan files:

```
%syntax-version=1.0.0
%project=myproject
%uri=https://github.com/myorg/myproject

schema 2024-01-01T00:00:00Z developer <dev@example.com> # Create schema
users [schema] 2024-01-02T00:00:00Z developer <dev@example.com> # Create users table
posts [users] 2024-01-03T00:00:00Z developer <dev@example.com> # Create posts table
```

## Differences from Sqitch

1. **State Storage**: Migration state is stored in PostgreSQL instead of a separate registry
2. **No Tags**: The system doesn't support Sqitch tags (yet)
3. **Simplified Events**: Event logging is minimal compared to Sqitch
4. **Script Hashing**: Uses SHA256 for script content hashing
5. **Native TypeScript**: No need to install Sqitch or Perl

## License

See LICENSE in the root of the repository.