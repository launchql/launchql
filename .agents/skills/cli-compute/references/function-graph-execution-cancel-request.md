# functionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for FunctionGraphExecutionCancelRequest records via csdk CLI

## Usage

```bash
csdk function-graph-execution-cancel-request list
csdk function-graph-execution-cancel-request list --where.<field>.<op> <value> --orderBy <values>
csdk function-graph-execution-cancel-request list --limit 10 --after <cursor>
csdk function-graph-execution-cancel-request find-first --where.<field>.<op> <value>
csdk function-graph-execution-cancel-request get --id <UUID>
csdk function-graph-execution-cancel-request create --executionId <UUID> [--actorId <UUID>]
csdk function-graph-execution-cancel-request update --id <UUID> [--actorId <UUID>] [--executionId <UUID>]
csdk function-graph-execution-cancel-request delete --id <UUID>
```

## Examples

### List functionGraphExecutionCancelRequest records

```bash
csdk function-graph-execution-cancel-request list
```

### List functionGraphExecutionCancelRequest records with pagination

```bash
csdk function-graph-execution-cancel-request list --limit 10 --offset 0
```

### List functionGraphExecutionCancelRequest records with cursor pagination

```bash
csdk function-graph-execution-cancel-request list --limit 10 --after <cursor>
```

### Find first matching functionGraphExecutionCancelRequest

```bash
csdk function-graph-execution-cancel-request find-first --where.id.equalTo <value>
```

### List functionGraphExecutionCancelRequest records with field selection

```bash
csdk function-graph-execution-cancel-request list --select id,id
```

### List functionGraphExecutionCancelRequest records with filtering and ordering

```bash
csdk function-graph-execution-cancel-request list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a functionGraphExecutionCancelRequest

```bash
csdk function-graph-execution-cancel-request create --executionId <UUID> [--actorId <UUID>]
```

### Get a functionGraphExecutionCancelRequest by id

```bash
csdk function-graph-execution-cancel-request get --id <value>
```
