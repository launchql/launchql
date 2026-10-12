# machinesEnroll

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the machinesEnroll mutation

## Usage

```typescript
db.mutation.machinesEnroll({ input: { entityId: '<UUID>', isShared: '<Boolean>', label: '<String>', relayUrl: '<String>', tokenHash: '<String>' } }).execute()
```

## Examples

### Run machinesEnroll

```typescript
const result = await db.mutation.machinesEnroll({ input: { entityId: '<UUID>', isShared: '<Boolean>', label: '<String>', relayUrl: '<String>', tokenHash: '<String>' } }).execute();
```
