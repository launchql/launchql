# uniqueConstraint

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for UniqueConstraint records

## Usage

```typescript
db.uniqueConstraint.findMany({ select: { id: true } }).execute()
db.uniqueConstraint.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.uniqueConstraint.create({ data: { category: '<ObjectCategory>', databaseId: '<UUID>', description: '<String>', fieldIds: '<UUID>', initiallyDeferred: '<Boolean>', isDeferrable: '<Boolean>', name: '<String>', nullsNotDistinct: '<Boolean>', smartTags: '<JSON>', tableId: '<UUID>', tags: '<String>', type: '<String>', withoutOverlaps: '<Boolean>' }, select: { id: true } }).execute()
db.uniqueConstraint.update({ where: { id: '<UUID>' }, data: { category: '<ObjectCategory>' }, select: { id: true } }).execute()
db.uniqueConstraint.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all uniqueConstraint records

```typescript
const items = await db.uniqueConstraint.findMany({
  select: { id: true, category: true }
}).execute();
```

### Create a uniqueConstraint

```typescript
const item = await db.uniqueConstraint.create({
  data: { category: '<ObjectCategory>', databaseId: '<UUID>', description: '<String>', fieldIds: '<UUID>', initiallyDeferred: '<Boolean>', isDeferrable: '<Boolean>', name: '<String>', nullsNotDistinct: '<Boolean>', smartTags: '<JSON>', tableId: '<UUID>', tags: '<String>', type: '<String>', withoutOverlaps: '<Boolean>' },
  select: { id: true }
}).execute();
```
