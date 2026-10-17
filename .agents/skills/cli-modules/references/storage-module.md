# storageModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for StorageModule records via csdk CLI

## Usage

```bash
csdk storage-module list
csdk storage-module list --where.<field>.<op> <value> --orderBy <values>
csdk storage-module list --limit 10 --after <cursor>
csdk storage-module find-first --where.<field>.<op> <value>
csdk storage-module get --id <UUID>
csdk storage-module create --databaseId <UUID> --scope <String> [--allowedOrigins <String>] [--apiName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--cacheTtlSeconds <Int>] [--catalogModuleId <UUID>] [--confirmUploadDelay <Interval>] [--defaultCapabilities <String>] [--defaultMaxFileSize <BigInt>] [--downloadUrlExpirySeconds <Int>] [--endpoint <String>] [--entityField <String>] [--entityTableId <UUID>] [--fileEventsTableId <UUID>] [--filesTableId <UUID>] [--filesTableName <String>] [--hasAuditLog <Boolean>] [--hasConfirmUpload <Boolean>] [--hasContentHash <Boolean>] [--hasCustomKeys <Boolean>] [--hasPathShares <Boolean>] [--hasVersioning <Boolean>] [--key <String>] [--maxBulkFiles <Int>] [--maxBulkTotalSize <BigInt>] [--maxFilenameLength <Int>] [--pathSharesTableId <UUID>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provider <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--publicUrlPrefix <String>] [--region <String>] [--restrictReads <Boolean>] [--schemaId <UUID>] [--uploadUrlExpirySeconds <Int>]
csdk storage-module update --id <UUID> [--allowedOrigins <String>] [--apiName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--cacheTtlSeconds <Int>] [--catalogModuleId <UUID>] [--confirmUploadDelay <Interval>] [--databaseId <UUID>] [--defaultCapabilities <String>] [--defaultMaxFileSize <BigInt>] [--downloadUrlExpirySeconds <Int>] [--endpoint <String>] [--entityField <String>] [--entityTableId <UUID>] [--fileEventsTableId <UUID>] [--filesTableId <UUID>] [--filesTableName <String>] [--hasAuditLog <Boolean>] [--hasConfirmUpload <Boolean>] [--hasContentHash <Boolean>] [--hasCustomKeys <Boolean>] [--hasPathShares <Boolean>] [--hasVersioning <Boolean>] [--key <String>] [--maxBulkFiles <Int>] [--maxBulkTotalSize <BigInt>] [--maxFilenameLength <Int>] [--pathSharesTableId <UUID>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provider <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--publicUrlPrefix <String>] [--region <String>] [--restrictReads <Boolean>] [--schemaId <UUID>] [--scope <String>] [--uploadUrlExpirySeconds <Int>]
csdk storage-module delete --id <UUID>
```

## Examples

### List storageModule records

```bash
csdk storage-module list
```

### List storageModule records with pagination

```bash
csdk storage-module list --limit 10 --offset 0
```

### List storageModule records with cursor pagination

```bash
csdk storage-module list --limit 10 --after <cursor>
```

### Find first matching storageModule

```bash
csdk storage-module find-first --where.id.equalTo <value>
```

### List storageModule records with field selection

```bash
csdk storage-module list --select id,id
```

### List storageModule records with filtering and ordering

```bash
csdk storage-module list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a storageModule

```bash
csdk storage-module create --databaseId <UUID> --scope <String> [--allowedOrigins <String>] [--apiName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--cacheTtlSeconds <Int>] [--catalogModuleId <UUID>] [--confirmUploadDelay <Interval>] [--defaultCapabilities <String>] [--defaultMaxFileSize <BigInt>] [--downloadUrlExpirySeconds <Int>] [--endpoint <String>] [--entityField <String>] [--entityTableId <UUID>] [--fileEventsTableId <UUID>] [--filesTableId <UUID>] [--filesTableName <String>] [--hasAuditLog <Boolean>] [--hasConfirmUpload <Boolean>] [--hasContentHash <Boolean>] [--hasCustomKeys <Boolean>] [--hasPathShares <Boolean>] [--hasVersioning <Boolean>] [--key <String>] [--maxBulkFiles <Int>] [--maxBulkTotalSize <BigInt>] [--maxFilenameLength <Int>] [--pathSharesTableId <UUID>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provider <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--publicUrlPrefix <String>] [--region <String>] [--restrictReads <Boolean>] [--schemaId <UUID>] [--uploadUrlExpirySeconds <Int>]
```

### Get a storageModule by id

```bash
csdk storage-module get --id <value>
```
