# createApiKey

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Mint an API key for the current user; the plaintext key is returned once. access_level: full_access (default) or read_only. mfa_level: none (default) or verified; verified needs a fresh MFA proof on the calling session. A key minted while authenticated by another API key never outlives that key.

## Usage

```typescript
db.mutation.createApiKey({ input: { accessLevel: '<String>', expiresIn: '<IntervalInput>', keyName: '<String>', mfaLevel: '<String>', principalId: '<UUID>' } }).execute()
```

## Examples

### Run createApiKey

```typescript
const result = await db.mutation.createApiKey({ input: { accessLevel: '<String>', expiresIn: '<IntervalInput>', keyName: '<String>', mfaLevel: '<String>', principalId: '<UUID>' } }).execute();
```
