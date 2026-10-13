# sendMfaChallengeCode

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the sendMfaChallengeCode mutation

## Usage

```typescript
db.mutation.sendMfaChallengeCode({ input: { mfaChallengeToken: '<String>', mfaMethod: '<String>', userId: '<UUID>' } }).execute()
```

## Examples

### Run sendMfaChallengeCode

```typescript
const result = await db.mutation.sendMfaChallengeCode({ input: { mfaChallengeToken: '<String>', mfaMethod: '<String>', userId: '<UUID>' } }).execute();
```
