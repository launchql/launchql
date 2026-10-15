# storageModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for StorageModule records

## Usage

```typescript
db.storageModule.findMany({ select: { id: true } }).execute()
db.storageModule.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.storageModule.create({ data: { allowedOrigins: '<String>', apiName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', cacheTtlSeconds: '<Int>', catalogModuleId: '<UUID>', confirmUploadDelay: '<Interval>', databaseId: '<UUID>', defaultCapabilities: '<String>', defaultMaxFileSize: '<BigInt>', downloadUrlExpirySeconds: '<Int>', endpoint: '<String>', entityField: '<String>', entityTableId: '<UUID>', fileEventsTableId: '<UUID>', filesTableId: '<UUID>', filesTableName: '<String>', hasAuditLog: '<Boolean>', hasConfirmUpload: '<Boolean>', hasContentHash: '<Boolean>', hasCustomKeys: '<Boolean>', hasPathShares: '<Boolean>', hasVersioning: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxBulkTotalSize: '<BigInt>', maxFilenameLength: '<Int>', pathSharesTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provider: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', publicUrlPrefix: '<String>', region: '<String>', restrictReads: '<Boolean>', schemaId: '<UUID>', scope: '<String>', uploadUrlExpirySeconds: '<Int>' }, select: { id: true } }).execute()
db.storageModule.update({ where: { id: '<UUID>' }, data: { allowedOrigins: '<String>' }, select: { id: true } }).execute()
db.storageModule.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all storageModule records

```typescript
const items = await db.storageModule.findMany({
  select: { id: true, allowedOrigins: true }
}).execute();
```

### Create a storageModule

```typescript
const item = await db.storageModule.create({
  data: { allowedOrigins: '<String>', apiName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', cacheTtlSeconds: '<Int>', catalogModuleId: '<UUID>', confirmUploadDelay: '<Interval>', databaseId: '<UUID>', defaultCapabilities: '<String>', defaultMaxFileSize: '<BigInt>', downloadUrlExpirySeconds: '<Int>', endpoint: '<String>', entityField: '<String>', entityTableId: '<UUID>', fileEventsTableId: '<UUID>', filesTableId: '<UUID>', filesTableName: '<String>', hasAuditLog: '<Boolean>', hasConfirmUpload: '<Boolean>', hasContentHash: '<Boolean>', hasCustomKeys: '<Boolean>', hasPathShares: '<Boolean>', hasVersioning: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxBulkTotalSize: '<BigInt>', maxFilenameLength: '<Int>', pathSharesTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provider: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', publicUrlPrefix: '<String>', region: '<String>', restrictReads: '<Boolean>', schemaId: '<UUID>', scope: '<String>', uploadUrlExpirySeconds: '<Int>' },
  select: { id: true }
}).execute();
```
