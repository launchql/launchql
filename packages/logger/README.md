# @launchql/logger

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

Simple logger utility with yanse colors for consistent logging across packages.

## Installation

```bash
npm install @launchql/logger
```

## Features

- Colored console output using yanse
- Consistent log formatting
- Namespace support for identifying log sources
- Simple API with log, error, and warn methods

## Usage

```typescript
import { Logger } from '@launchql/logger';

// Create a logger with a namespace
const log = new Logger('my-module');

// Log messages
log.log('This is a regular message');
log.error('This is an error message');
log.warn('This is a warning message');

// Messages will be prefixed with the namespace in color
// [my-module] This is a regular message
```

## API

### `new Logger(namespace: string)`

Creates a new logger instance with the given namespace.

### Methods

- `log(...args: any[]): void` - Log a regular message (cyan namespace)
- `error(...args: any[]): void` - Log an error message (red namespace)
- `warn(...args: any[]): void` - Log a warning message (yellow namespace)

## Example

```typescript
import { Logger } from '@launchql/logger';

const dbLog = new Logger('database');
const apiLog = new Logger('api');

dbLog.log('Connected to PostgreSQL');
// Output: [database] Connected to PostgreSQL (with cyan [database])

apiLog.error('Failed to fetch user:', error);
// Output: [api] Failed to fetch user: ... (with red [api])

apiLog.warn('Rate limit approaching');
// Output: [api] Rate limit approaching (with yellow [api])
```
