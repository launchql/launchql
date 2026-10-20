# functionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for FunctionInvocation records via csdk CLI

## Usage

```bash
csdk function-invocation list
csdk function-invocation list --where.<field>.<op> <value> --orderBy <values>
csdk function-invocation list --limit 10 --after <cursor>
csdk function-invocation find-first --where.<field>.<op> <value>
csdk function-invocation get --id <UUID>
csdk function-invocation create --channel <String> --databaseId <UUID> --taskIdentifier <String> [--actorId <UUID>] [--apiBindingId <UUID>] [--completedAt <Datetime>] [--createdByPrincipal <UUID>] [--definitionScope <String>] [--durationMs <Int>] [--entityId <UUID>] [--entityType <String>] [--error <String>] [--functionDefinitionId <UUID>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--jobKey <String>] [--organizationId <UUID>] [--parentInvocationId <UUID>] [--payload <JSON>] [--principalId <UUID>] [--provenance <JSON>] [--queueName <String>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
csdk function-invocation update --id <UUID> [--actorId <UUID>] [--apiBindingId <UUID>] [--channel <String>] [--completedAt <Datetime>] [--createdByPrincipal <UUID>] [--databaseId <UUID>] [--definitionScope <String>] [--durationMs <Int>] [--entityId <UUID>] [--entityType <String>] [--error <String>] [--functionDefinitionId <UUID>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--jobKey <String>] [--organizationId <UUID>] [--parentInvocationId <UUID>] [--payload <JSON>] [--principalId <UUID>] [--provenance <JSON>] [--queueName <String>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>] [--taskIdentifier <String>]
csdk function-invocation delete --id <UUID>
```

## Examples

### List functionInvocation records

```bash
csdk function-invocation list
```

### List functionInvocation records with pagination

```bash
csdk function-invocation list --limit 10 --offset 0
```

### List functionInvocation records with cursor pagination

```bash
csdk function-invocation list --limit 10 --after <cursor>
```

### Find first matching functionInvocation

```bash
csdk function-invocation find-first --where.id.equalTo <value>
```

### List functionInvocation records with field selection

```bash
csdk function-invocation list --select id,id
```

### List functionInvocation records with filtering and ordering

```bash
csdk function-invocation list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a functionInvocation

```bash
csdk function-invocation create --channel <String> --databaseId <UUID> --taskIdentifier <String> [--actorId <UUID>] [--apiBindingId <UUID>] [--completedAt <Datetime>] [--createdByPrincipal <UUID>] [--definitionScope <String>] [--durationMs <Int>] [--entityId <UUID>] [--entityType <String>] [--error <String>] [--functionDefinitionId <UUID>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--jobKey <String>] [--organizationId <UUID>] [--parentInvocationId <UUID>] [--payload <JSON>] [--principalId <UUID>] [--provenance <JSON>] [--queueName <String>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
```

### Get a functionInvocation by id

```bash
csdk function-invocation get --id <value>
```
