# blueprintConstruction

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Tracks individual construction attempts of a blueprint. Each time construct_blueprint() is called, a new record is created here as pending and a blueprint:construct job builds it in the background. This separates the editable blueprint definition from its build history, allowing blueprints to be re-executed, constructed into multiple databases, and maintain an audit trail of all construction attempts, including failed ones.

## Usage

```typescript
db.blueprintConstruction.findMany({ select: { id: true } }).execute()
db.blueprintConstruction.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.blueprintConstruction.create({ data: { blueprintId: '<UUID>', constructedAt: '<Datetime>', constructedDefinition: '<JSON>', databaseId: '<UUID>', error: '<JSON>', schemaId: '<UUID>', status: '<String>', tableMap: '<JSON>' }, select: { id: true } }).execute()
db.blueprintConstruction.update({ where: { id: '<UUID>' }, data: { blueprintId: '<UUID>' }, select: { id: true } }).execute()
db.blueprintConstruction.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all blueprintConstruction records

```typescript
const items = await db.blueprintConstruction.findMany({
  select: { id: true, blueprintId: true }
}).execute();
```

### Create a blueprintConstruction

```typescript
const item = await db.blueprintConstruction.create({
  data: { blueprintId: '<UUID>', constructedAt: '<Datetime>', constructedDefinition: '<JSON>', databaseId: '<UUID>', error: '<JSON>', schemaId: '<UUID>', status: '<String>', tableMap: '<JSON>' },
  select: { id: true }
}).execute();
```
