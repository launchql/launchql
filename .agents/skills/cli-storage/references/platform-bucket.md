# platformBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformBucket records via csdk CLI

## Usage

```bash
csdk platform-bucket list
csdk platform-bucket list --where.<field>.<op> <value> --orderBy <values>
csdk platform-bucket list --limit 10 --after <cursor>
csdk platform-bucket find-first --where.<field>.<op> <value>
csdk platform-bucket get --id <UUID>
csdk platform-bucket create --actorId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
csdk platform-bucket update --id <UUID> [--actorId <UUID>] [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--key <String>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
csdk platform-bucket delete --id <UUID>
```

## Examples

### List platformBucket records

```bash
csdk platform-bucket list
```

### List platformBucket records with pagination

```bash
csdk platform-bucket list --limit 10 --offset 0
```

### List platformBucket records with cursor pagination

```bash
csdk platform-bucket list --limit 10 --after <cursor>
```

### Find first matching platformBucket

```bash
csdk platform-bucket find-first --where.id.equalTo <value>
```

### List platformBucket records with field selection

```bash
csdk platform-bucket list --select id,id
```

### List platformBucket records with filtering and ordering

```bash
csdk platform-bucket list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformBucket

```bash
csdk platform-bucket create --actorId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
```

### Get a platformBucket by id

```bash
csdk platform-bucket get --id <value>
```
