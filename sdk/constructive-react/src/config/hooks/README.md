# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useAppInternalSecretsQuery` | Query | List all appInternalSecrets |
| `useAppInternalSecretQuery` | Query | Get one appInternalSecret |
| `useCreateAppInternalSecretMutation` | Mutation | Create a appInternalSecret |
| `useUpdateAppInternalSecretMutation` | Mutation | Update a appInternalSecret |
| `useDeleteAppInternalSecretMutation` | Mutation | Delete a appInternalSecret |
| `useConfigsQuery` | Query | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useConfigQuery` | Query | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useCreateConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useUpdateConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useDeleteConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useInternalConfigsQuery` | Query | -level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useInternalConfigQuery` | Query | -level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useCreateInternalConfigMutation` | Mutation | -level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useUpdateInternalConfigMutation` | Mutation | -level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useDeleteInternalConfigMutation` | Mutation | -level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useInternalSecretsQuery` | Query | List all internalSecrets |
| `useInternalSecretQuery` | Query | Get one internalSecret |
| `useCreateInternalSecretMutation` | Mutation | Create a internalSecret |
| `useUpdateInternalSecretMutation` | Mutation | Update a internalSecret |
| `useDeleteInternalSecretMutation` | Mutation | Delete a internalSecret |
| `usePlatformConfigsQuery` | Query | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `usePlatformConfigQuery` | Query | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useCreatePlatformConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useUpdatePlatformConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useDeletePlatformConfigMutation` | Mutation | Namespace-backed plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `usePlatformInternalConfigsQuery` | Query | platform-level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `usePlatformInternalConfigQuery` | Query | platform-level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useCreatePlatformInternalConfigMutation` | Mutation | platform-level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useUpdatePlatformInternalConfigMutation` | Mutation | platform-level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `useDeletePlatformInternalConfigMutation` | Mutation | platform-level plaintext key-value config store; database-resident, never projected into Kubernetes |
| `usePlatformInternalSecretsQuery` | Query | List all platformInternalSecrets |
| `usePlatformInternalSecretQuery` | Query | Get one platformInternalSecret |
| `useCreatePlatformInternalSecretMutation` | Mutation | Create a platformInternalSecret |
| `useUpdatePlatformInternalSecretMutation` | Mutation | Update a platformInternalSecret |
| `useDeletePlatformInternalSecretMutation` | Mutation | Delete a platformInternalSecret |
| `usePlatformSecretsQuery` | Query | List all platformSecrets |
| `usePlatformSecretQuery` | Query | Get one platformSecret |
| `useCreatePlatformSecretMutation` | Mutation | Create a platformSecret |
| `useUpdatePlatformSecretMutation` | Mutation | Update a platformSecret |
| `useDeletePlatformSecretMutation` | Mutation | Delete a platformSecret |
| `useSecretsQuery` | Query | List all secrets |
| `useSecretQuery` | Query | Get one secret |
| `useCreateSecretMutation` | Mutation | Create a secret |
| `useUpdateSecretMutation` | Mutation | Update a secret |
| `useDeleteSecretMutation` | Mutation | Delete a secret |
| `use_internalSecretsDelMutation` | Mutation | _internalSecretsDel |
| `use_internalSecretsRemoveArrayMutation` | Mutation | _internalSecretsRemoveArray |
| `use_internalSecretsRotateMutation` | Mutation | _internalSecretsRotate |
| `use_internalSecretsSetMutation` | Mutation | _internalSecretsSet |
| `use_secretsDelMutation` | Mutation | _secretsDel |
| `use_secretsRemoveArrayMutation` | Mutation | _secretsRemoveArray |
| `use_secretsRotateMutation` | Mutation | _secretsRotate |
| `use_secretsSetMutation` | Mutation | _secretsSet |
| `useAppInternalSecretsDelMutation` | Mutation | appInternalSecretsDel |
| `useAppInternalSecretsRemoveArrayMutation` | Mutation | appInternalSecretsRemoveArray |
| `useAppInternalSecretsRotateMutation` | Mutation | appInternalSecretsRotate |
| `useAppInternalSecretsSetMutation` | Mutation | appInternalSecretsSet |
| `usePlatformInternalSecretsDelMutation` | Mutation | platformInternalSecretsDel |
| `usePlatformInternalSecretsRemoveArrayMutation` | Mutation | platformInternalSecretsRemoveArray |
| `usePlatformInternalSecretsRotateMutation` | Mutation | platformInternalSecretsRotate |
| `usePlatformInternalSecretsSetMutation` | Mutation | platformInternalSecretsSet |
| `usePlatformSecretsDelMutation` | Mutation | platformSecretsDel |
| `usePlatformSecretsRemoveArrayMutation` | Mutation | platformSecretsRemoveArray |
| `usePlatformSecretsRotateMutation` | Mutation | platformSecretsRotate |
| `usePlatformSecretsSetMutation` | Mutation | platformSecretsSet |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |

## Table Hooks

### AppInternalSecret

```typescript
// List all appInternalSecrets
const { data, isLoading } = useAppInternalSecretsQuery({
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Get one appInternalSecret
const { data: item } = useAppInternalSecretQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Create a appInternalSecret
const { mutate: create } = useCreateAppInternalSecretMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' });
```

### Config

```typescript
// List all configs
const { data, isLoading } = useConfigsQuery({
  selection: { fields: { annotations: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } },
});

// Get one config
const { data: item } = useConfigQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } },
});

// Create a config
const { mutate: create } = useCreateConfigMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', updatedByPrincipal: '<UUID>', value: '<String>' });
```

### InternalConfig

```typescript
// List all internalConfigs
const { data, isLoading } = useInternalConfigsQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } },
});

// Get one internalConfig
const { data: item } = useInternalConfigQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } },
});

// Create a internalConfig
const { mutate: create } = useCreateInternalConfigMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', provider: '<String>', realm: '<String>', value: '<String>' });
```

### InternalSecret

```typescript
// List all internalSecrets
const { data, isLoading } = useInternalSecretsQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Get one internalSecret
const { data: item } = useInternalSecretQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Create a internalSecret
const { mutate: create } = useCreateInternalSecretMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' });
```

### PlatformConfig

```typescript
// List all platformConfigs
const { data, isLoading } = usePlatformConfigsQuery({
  selection: { fields: { annotations: true, createdAt: true, createdByPrincipal: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } },
});

// Get one platformConfig
const { data: item } = usePlatformConfigQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, createdByPrincipal: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } },
});

// Create a platformConfig
const { mutate: create } = useCreatePlatformConfigMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', createdByPrincipal: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', updatedByPrincipal: '<UUID>', value: '<String>' });
```

### PlatformInternalConfig

```typescript
// List all platformInternalConfigs
const { data, isLoading } = usePlatformInternalConfigsQuery({
  selection: { fields: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } },
});

// Get one platformInternalConfig
const { data: item } = usePlatformInternalConfigQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } },
});

// Create a platformInternalConfig
const { mutate: create } = useCreatePlatformInternalConfigMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', provider: '<String>', realm: '<String>', value: '<String>' });
```

### PlatformInternalSecret

```typescript
// List all platformInternalSecrets
const { data, isLoading } = usePlatformInternalSecretsQuery({
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Get one platformInternalSecret
const { data: item } = usePlatformInternalSecretQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Create a platformInternalSecret
const { mutate: create } = useCreatePlatformInternalSecretMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' });
```

### PlatformSecret

```typescript
// List all platformSecrets
const { data, isLoading } = usePlatformSecretsQuery({
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Get one platformSecret
const { data: item } = usePlatformSecretQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Create a platformSecret
const { mutate: create } = useCreatePlatformSecretMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' });
```

### Secret

```typescript
// List all secrets
const { data, isLoading } = useSecretsQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Get one secret
const { data: item } = useSecretQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } },
});

// Create a secret
const { mutate: create } = useCreateSecretMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' });
```

## Custom Operation Hooks

### `use_internalSecretsDelMutation`

_internalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsDelInput (required) |

### `use_internalSecretsRemoveArrayMutation`

_internalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsRemoveArrayInput (required) |

### `use_internalSecretsRotateMutation`

_internalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsRotateInput (required) |

### `use_internalSecretsSetMutation`

_internalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsSetInput (required) |

### `use_secretsDelMutation`

_secretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsDelInput (required) |

### `use_secretsRemoveArrayMutation`

_secretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsRemoveArrayInput (required) |

### `use_secretsRotateMutation`

_secretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsRotateInput (required) |

### `use_secretsSetMutation`

_secretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsSetInput (required) |

### `useAppInternalSecretsDelMutation`

appInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsDelInput (required) |

### `useAppInternalSecretsRemoveArrayMutation`

appInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsRemoveArrayInput (required) |

### `useAppInternalSecretsRotateMutation`

appInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsRotateInput (required) |

### `useAppInternalSecretsSetMutation`

appInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsSetInput (required) |

### `usePlatformInternalSecretsDelMutation`

platformInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsDelInput (required) |

### `usePlatformInternalSecretsRemoveArrayMutation`

platformInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsRemoveArrayInput (required) |

### `usePlatformInternalSecretsRotateMutation`

platformInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsRotateInput (required) |

### `usePlatformInternalSecretsSetMutation`

platformInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsSetInput (required) |

### `usePlatformSecretsDelMutation`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsDelInput (required) |

### `usePlatformSecretsRemoveArrayMutation`

platformSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsRemoveArrayInput (required) |

### `usePlatformSecretsRotateMutation`

platformSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsRotateInput (required) |

### `usePlatformSecretsSetMutation`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsSetInput (required) |

### `useProvisionBucketMutation`

Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |
