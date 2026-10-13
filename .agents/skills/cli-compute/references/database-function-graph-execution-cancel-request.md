# databaseFunctionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for DatabaseFunctionGraphExecutionCancelRequest records via csdk CLI

## Usage

```bash
csdk database-function-graph-execution-cancel-request list
csdk database-function-graph-execution-cancel-request list --where.<field>.<op> <value> --orderBy <values>
csdk database-function-graph-execution-cancel-request list --limit 10 --after <cursor>
csdk database-function-graph-execution-cancel-request find-first --where.<field>.<op> <value>
csdk database-function-graph-execution-cancel-request get --id <UUID>
csdk database-function-graph-execution-cancel-request create --executionId <UUID> [--actorId <UUID>]
csdk database-function-graph-execution-cancel-request update --id <UUID> [--actorId <UUID>] [--executionId <UUID>]
csdk database-function-graph-execution-cancel-request delete --id <UUID>
```

## Examples

### List databaseFunctionGraphExecutionCancelRequest records

```bash
csdk database-function-graph-execution-cancel-request list
```

### List databaseFunctionGraphExecutionCancelRequest records with pagination

```bash
csdk database-function-graph-execution-cancel-request list --limit 10 --offset 0
```

### List databaseFunctionGraphExecutionCancelRequest records with cursor pagination

```bash
csdk database-function-graph-execution-cancel-request list --limit 10 --after <cursor>
```

### Find first matching databaseFunctionGraphExecutionCancelRequest

```bash
csdk database-function-graph-execution-cancel-request find-first --where.id.equalTo <value>
```

### List databaseFunctionGraphExecutionCancelRequest records with field selection

```bash
csdk database-function-graph-execution-cancel-request list --select id,id
```

### List databaseFunctionGraphExecutionCancelRequest records with filtering and ordering

```bash
csdk database-function-graph-execution-cancel-request list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a databaseFunctionGraphExecutionCancelRequest

```bash
csdk database-function-graph-execution-cancel-request create --executionId <UUID> [--actorId <UUID>]
```

### Get a databaseFunctionGraphExecutionCancelRequest by id

```bash
csdk database-function-graph-execution-cancel-request get --id <value>
```
