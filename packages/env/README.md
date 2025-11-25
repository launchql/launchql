# @launchql/env

Environment management for LaunchQL projects. Provides unified configuration resolution from defaults, config files, environment variables, and overrides.

## Features

- Config file discovery using `walkUp` utility
- Environment variable parsing
- Unified merge hierarchy: defaults → config → env vars → overrides
- TypeScript support with full type safety

## Usage

```typescript
import { getEnvOptions } from '@launchql/env';

const options = getEnvOptions(overrides, cwd);
```
