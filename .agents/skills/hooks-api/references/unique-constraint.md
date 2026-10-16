# uniqueConstraint

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for UniqueConstraint data operations

## Usage

```typescript
useUniqueConstraintsQuery({ selection: { fields: { category: true, createdAt: true, databaseId: true, description: true, fieldIds: true, id: true, initiallyDeferred: true, isDeferrable: true, name: true, nullsNotDistinct: true, smartTags: true, tableId: true, tags: true, type: true, updatedAt: true, withoutOverlaps: true } } })
useUniqueConstraintQuery({ id: '<UUID>', selection: { fields: { category: true, createdAt: true, databaseId: true, description: true, fieldIds: true, id: true, initiallyDeferred: true, isDeferrable: true, name: true, nullsNotDistinct: true, smartTags: true, tableId: true, tags: true, type: true, updatedAt: true, withoutOverlaps: true } } })
useCreateUniqueConstraintMutation({ selection: { fields: { id: true } } })
useUpdateUniqueConstraintMutation({ selection: { fields: { id: true } } })
useDeleteUniqueConstraintMutation({})
```

## Examples

### List all uniqueConstraints

```typescript
const { data, isLoading } = useUniqueConstraintsQuery({
  selection: { fields: { category: true, createdAt: true, databaseId: true, description: true, fieldIds: true, id: true, initiallyDeferred: true, isDeferrable: true, name: true, nullsNotDistinct: true, smartTags: true, tableId: true, tags: true, type: true, updatedAt: true, withoutOverlaps: true } },
});
```

### Create a uniqueConstraint

```typescript
const { mutate } = useCreateUniqueConstraintMutation({
  selection: { fields: { id: true } },
});
mutate({ category: '<ObjectCategory>', databaseId: '<UUID>', description: '<String>', fieldIds: '<UUID>', initiallyDeferred: '<Boolean>', isDeferrable: '<Boolean>', name: '<String>', nullsNotDistinct: '<Boolean>', smartTags: '<JSON>', tableId: '<UUID>', tags: '<String>', type: '<String>', withoutOverlaps: '<Boolean>' });
```
