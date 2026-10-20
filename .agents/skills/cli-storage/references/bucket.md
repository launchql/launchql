# bucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Bucket records via csdk CLI

## Usage

```bash
csdk bucket list
csdk bucket list --where.<field>.<op> <value> --orderBy <values>
csdk bucket list --limit 10 --after <cursor>
csdk bucket find-first --where.<field>.<op> <value>
csdk bucket get --id <UUID>
csdk bucket create --actorId <UUID> --databaseId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
csdk bucket update --id <UUID> [--actorId <UUID>] [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--databaseId <UUID>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--key <String>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
csdk bucket delete --id <UUID>
```

## Examples

### List bucket records

```bash
csdk bucket list
```

### List bucket records with pagination

```bash
csdk bucket list --limit 10 --offset 0
```

### List bucket records with cursor pagination

```bash
csdk bucket list --limit 10 --after <cursor>
```

### Find first matching bucket

```bash
csdk bucket find-first --where.id.equalTo <value>
```

### List bucket records with field selection

```bash
csdk bucket list --select id,id
```

### List bucket records with filtering and ordering

```bash
csdk bucket list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a bucket

```bash
csdk bucket create --actorId <UUID> --databaseId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--destinationBucketId <UUID>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--physicalName <String>] [--provisionRequestedAt <Datetime>] [--stagingTtl <Interval>] [--tags <String>] [--type <BucketType>]
```

### Get a bucket by id

```bash
csdk bucket get --id <value>
```
