# Generated GraphQL SDK

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Overview

- **Tables:** 90
- **Custom queries:** 17
- **Custom mutations:** 29

**Generators:** ORM

## Modules

### ORM Client (`./orm`)

Prisma-like ORM client for programmatic GraphQL access.

```typescript
import { createClient } from './orm';

const db = createClient({
  endpoint: 'https://api.example.com/graphql',
});
```

See [orm/README.md](./orm/README.md) for full API reference.
