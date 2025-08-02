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
The npm dependency tree shows conflicts with our GraphQL 15.5.2 resolution:

```bash
npm ls graphql --all
```

**Conflicting packages:**
- `graphql-upload@15.0.2` expects `^16.3.0`
- `@pyramation/postgis` expects `>=0.6 <15`
- Current resolution: `15.5.2` (conflicts with both)

### 3. Invalid Dependencies Detected
```
graphql@15.5.2 deduped invalid: "^16.3.0" from node_modules/graphql-upload, ">=0.6 <15" from node_modules/@pyramation/postgis
```

## Current Resolutions in Place

The following packages now have GraphQL resolutions set to `15.5.2`:
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

Yarn's `resolutions` field doesn't always override peer dependency requirements. When packages have conflicting peer dependency ranges, Node.js can still load multiple versions of GraphQL, causing the "duplicate modules" error.

## Investigation Findings

### GraphQL-Upload Version Compatibility
- `graphql-upload@15.0.2` (current): requires `^16.3.0` ❌
- `graphql-upload@14.0.0`: requires `^16.3.0` ❌  
- `graphql-upload@13.0.0`: supports `0.13.1 - 16` ✅ (compatible with 15.5.2)
- `graphql-upload@11.0.0`: supports `0.13.1 - 15` ✅ (compatible with 15.5.2)

### PostGIS Package Compatibility
- `@pyramation/postgis@0.1.1` (only version): requires `>=0.6 <15` ❌ (incompatible with 15.5.2)

## Proposed Solution

### Option 1: Downgrade Incompatible Packages (Recommended)
1. **Downgrade graphql-upload**: From `15.0.2` to `13.0.0` (supports GraphQL 15.5.2)
2. **Handle @pyramation/postgis**: Add to overrides or find alternative package
3. **Add overrides field**: Stronger enforcement than resolutions
4. **Clean install**: Remove node_modules and yarn.lock, reinstall

### Option 2: Upgrade GraphQL (Higher Risk)
- Upgrade to GraphQL 16.x to satisfy `graphql-upload`
- Verify PostGraphile 4.14.1 compatibility with GraphQL 16.x
- Update all packages to support GraphQL 16.x

### Option 3: Alternative Packages
- Replace `graphql-upload` with a compatible alternative
- Replace `@pyramation/postgis` if no compatible version exists

## Next Steps

1. ✅ Document GraphQL dependency conflicts (this file)
2. 🔄 Downgrade graphql-upload from 15.0.2 to 13.0.0
3. ⏳ Add overrides field to root package.json
4. ⏳ Handle @pyramation/postgis incompatibility
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
