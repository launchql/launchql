# @launchql/core/files

This directory contains the functionality that was previously in the `@launchql/project-files` package. It has been integrated into the core package to simplify the codebase and improve maintainability.

## Structure

- `extension/`: Extension file handling
- `plan/`: Plan file parsing, generation, and writing
- `sql/`: SQL script handling
- `sql-scripts/`: SQL script reading and writing
- `types/`: Type definitions for migration entities

## Usage

All functionality is exported from the core package:

```typescript
import { 
  parsePlanFileSimple, 
  getChanges, 
  getExtensionName,
  readScript,
  scriptExists
} from '@launchql/core';
```