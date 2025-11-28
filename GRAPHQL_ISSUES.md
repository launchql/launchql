# GraphQL Dependency Issues

## Problem Summary

The LaunchQL monorepo experiences "duplicate GraphQL modules" errors due to conflicting GraphQL version requirements across the dependency tree, despite having GraphQL resolutions in place.

## Root Cause Analysis

### 1. Broad Version Range in PostGraphile
PostGraphile 4.14.1 accepts an extremely broad GraphQL version range:
```
"^0.6.0 || ^0.7.0 || ^0.8.0-b || ^0.9.0 || ^0.10.0 || ^0.11.0 || ^0.12.0 || ^0.13.0 || ^14.0.2 || ^15.0.0"
```

### 2. Conflicting Peer Dependencies
The npm dependency tree shows conflicts with our GraphQL 15.10.1 resolution:

```bash
npm ls graphql --all
```

**Conflicting packages (before fixes):**
- `graphql-upload@15.0.2` expects `^16.3.0`
- `@pyramation/postgis` expected `>=0.6 <15` (now replaced by workspace `graphile-postgis`)
- Current resolution: `15.10.1` (conflicted with the original graphql-upload version)

### 3. Invalid Dependencies Detected
```
graphql@15.10.1 deduped invalid: "^16.3.0" from node_modules/graphql-upload
```

## Current Resolutions in Place

The following packages now have GraphQL resolutions set to `15.10.1`:
- Root workspace (`package.json`)
- `@launchql/cli`
- `@launchql/server` 
- `@launchql/explorer`
- `@launchql/query`
- `@launchql/graphile-query`
- `@launchql/graphile-test`
- `graphile-settings` ✅ (recently added)
- `@launchql/types` ✅ (recently added)

## Why Resolutions Aren't Sufficient

pnpm's `overrides` field does not always override peer dependency requirements. When packages have conflicting peer dependency ranges, Node.js can still load multiple versions of GraphQL, causing the "duplicate modules" error.

## Investigation Findings

### GraphQL-Upload Version Compatibility
- `graphql-upload@15.0.2` (current): requires `^16.3.0` ❌
- `graphql-upload@14.0.0`: requires `^16.3.0` ❌  
- `graphql-upload@13.0.0`: supports `0.13.1 - 16` ✅ (compatible with GraphQL 15.x)
- `graphql-upload@11.0.0`: supports `0.13.1 - 15` ✅ (compatible with GraphQL 15.x)

### PostGIS Package Compatibility
- Replaced `@pyramation/postgis@0.1.1` (required `>=0.6 <15`) with workspace `graphile-postgis` built against GraphQL 15.x ✅

## Proposed Solution

### Option 1: Downgrade Incompatible Packages (Recommended)
1. **Downgrade graphql-upload**: From `15.0.2` to `13.0.0` (supports GraphQL 15.x)
2. **Replace @pyramation/postgis**: Use workspace `graphile-postgis` instead
3. **Add overrides field**: Stronger enforcement than resolutions
4. **Clean install**: Remove node_modules and pnpm-lock.yaml, then reinstall with `pnpm install`

### Option 2: Upgrade GraphQL (Higher Risk)
- Upgrade to GraphQL 16.x to satisfy `graphql-upload`
- Verify PostGraphile 4.14.1 compatibility with GraphQL 16.x
- Update all packages to support GraphQL 16.x

### Option 3: Alternative Packages
- Replace `graphql-upload` with a compatible alternative
- Use `graphile-postgis` (workspace replacement for `@pyramation/postgis`)

## Next Steps

1. ✅ Document GraphQL dependency conflicts (this file)
2. ✅ Downgrade graphql-upload from 15.0.2 to 13.0.0
3. ✅ Add overrides field to root package.json
4. ✅ Replace @pyramation/postgis with workspace graphile-postgis
5. ⏳ Clean install and verify no conflicts remain
6. ⏳ Test `lql server` command to ensure error is resolved

## Technical Details

### Commands Used for Investigation
```bash
# Check current GraphQL versions
npm ls graphql --all

# Check package version compatibility
npm view graphql-upload@13.0.0 peerDependencies.graphql
npm view @pyramation/postgis@latest peerDependencies.graphql

# Check PostGraphile dependency range
npm view postgraphile@4.14.1 dependencies.graphql
```

### Error Message
```
Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior.
```
