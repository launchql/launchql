# Generated GraphQL SDK

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Overview

- **Tables:** 15
- **Custom queries:** 6
- **Custom mutations:** 56

**Generators:** ORM, React Query

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

### React Query Hooks (`./hooks`)

Type-safe React Query hooks for data fetching and mutations.

```typescript
import { configure } from './hooks';
import { useCarsQuery } from './hooks';

configure({ endpoint: 'https://api.example.com/graphql' });
```

See [hooks/README.md](./hooks/README.md) for full hook reference.
