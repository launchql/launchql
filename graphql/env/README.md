# @constructive-io/graphql-env

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@constructive-io/graphql-env"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphql%2Fenv%2Fpackage.json"/></a>
</p>

Constructive environment configuration with GraphQL/Graphile support.

This package extends `@pgpmjs/env` with GraphQL-specific environment variable parsing and defaults for Constructive applications.

## Installation

```bash
npm install @constructive-io/graphql-env
```

## Usage

```typescript
import { getEnvOptions } from '@constructive-io/graphql-env';

// Get merged options (core PGPM + GraphQL defaults + env vars + config)
const options = getEnvOptions();

// With overrides
const options = getEnvOptions({
  graphile: { schema: ['public', 'app'] },
  features: { simpleInflection: true }
});
```

## Environment Variables

In addition to all environment variables supported by `@pgpmjs/env`, this package parses:

### GraphQL Schema
- `GRAPHILE_SCHEMA` - Comma-separated list of PostgreSQL schemas to expose

Schema-scoped introspection is configured through the Graphile preset in
`pgpm.json` or runtime options. The map is keyed by the final PostgreSQL
service name: omit a service or set it to `false` for stock introspection, set
it to `true` for scoped defaults, or provide `catalogTypes` and
`capabilityExtensions` explicitly.

### Scoped introspection environment overrides

The server maps these variables to
`graphile.preset.gather.pgScopedIntrospection.main`. `main` is the internal
PostgreSQL service name, not the routing service name (such as `local`).

| Variable | Accepted values |
| --- | --- |
| `GRAPHILE_SCOPED_INTROSPECTION` | `true` or `false` |
| `GRAPHILE_SCOPED_INTROSPECTION_CATALOG_TYPES` | `all` or `dependency-closure` |
| `GRAPHILE_SCOPED_INTROSPECTION_CAPABILITY_EXTENSIONS` | Comma-separated extension names, e.g. `pg_trgm,vector` |

- Unset variables do not override `pgpm.json`. With neither configuration nor
  environment settings, introspection remains stock.
- `true` enables scoped introspection while preserving advanced options in
  `pgpm.json`; without advanced options it uses Crystal's defaults
  (`catalogTypes: "all"`).
- Either advanced variable alone enables scoped introspection, including when
  the config file sets `main: false`.
- Explicit `false` overrides both advanced variables and the config file.
  Advanced variables are ignored, even if malformed, so one switch is enough
  to roll back to stock.
- Advanced options override only their own field. Extension lists replace the
  configured array, trim names and remove duplicates. An explicitly empty or
  whitespace-only extension variable clears the list to `[]`; unset preserves it.
- An empty or whitespace-only enable variable means unset. Other enable values
  must be lowercase `true` or `false` (surrounding whitespace is allowed).
  Catalog values must match one of the two lowercase choices exactly; an empty
  catalog value is invalid. Empty CSV items such as `pg_trgm,,vector` are invalid.
  Invalid active settings fail option resolution with the variable name.
- Precedence remains defaults < config file < environment < explicit runtime
  options. These variables affect only `main`.

```bash
# Enable default scoped introspection
export GRAPHILE_SCOPED_INTROSPECTION=true

# Optionally customize it
export GRAPHILE_SCOPED_INTROSPECTION_CATALOG_TYPES=dependency-closure
export GRAPHILE_SCOPED_INTROSPECTION_CAPABILITY_EXTENSIONS=pg_trgm,vector

# Roll back without removing the advanced variables
export GRAPHILE_SCOPED_INTROSPECTION=false
```

Restart the server after changing its environment. `capabilityExtensions`
retains introspection metadata for extension capabilities; it does not install
PostgreSQL extensions or change the API's exposed schemas.

### Grafast Cache Limits
- `GRAPHILE_QUERY_CACHE_MAX_LENGTH` - Maximum parsed and validated queries retained per schema
- `GRAPHILE_OPERATIONS_CACHE_MAX_LENGTH` - Maximum operations retained for plan lookup per schema
- `GRAPHILE_OPERATION_PLANS_CACHE_MAX_LENGTH` - Maximum context/variable-specific plans retained per operation

Each cache limit must be a safe integer of at least `2`. When omitted, Grafast's
upstream default for that cache remains in effect.

### Grafast Explain
- `GRAPHILE_EXPLAIN` - Allow clients to request Grafast plan/SQL output via the `x-graphql-explain` header (off unless set)

### Feature Flags
- `FEATURES_SIMPLE_INFLECTION` - Enable simple inflection plugin
- `FEATURES_OPPOSITE_BASE_NAMES` - Enable opposite base names
- `FEATURES_POSTGIS` - Enable PostGIS support

### API Configuration
- `API_ROUTING_SCHEMA` - Schema containing the compiled `resolve_route()` resolver (production routing always resolves through it)
- `API_IS_PUBLIC` - Whether API is public
- `API_EXPOSED_SCHEMAS` - Comma-separated list of exposed schemas
- `API_META_SCHEMAS` - Comma-separated list of meta schemas
- `API_ANON_ROLE` - Anonymous role name
- `API_ROLE_NAME` - Default role name
- `API_FLUSH_TOKEN` - Bearer token required by `POST /flush`; the route is not mounted when unset
- `API_INTROSPECTION_ROLE` - Role PostGraphile introspects as; unset means the pool's connecting role

## Defaults

GraphQL defaults are provided by `@constructive-io/graphql-types`:

```typescript
{
  graphile: {
    schema: [],
    extends: [],
    preset: {}
  },
  features: {
    simpleInflection: true,
    oppositeBaseNames: true,
    postgis: true
  },
  api: {
    exposedSchemas: [],
    anonRole: 'administrator',
    roleName: 'administrator',
    isPublic: true,
    metaSchemas: ['routing_public', 'metaschema_public', 'metaschema_modules_public'],
    routingSchema: 'routing_public'
  }
}
```

For example, this enables scoped introspection with the defaults for the
server's default `main` service:

```json
{
  "graphile": {
    "preset": {
      "gather": {
        "pgScopedIntrospection": { "main": true }
      }
    }
  }
}
```

Advanced options can be supplied when a service needs a specific catalog
policy or extension capability:

```json
{
  "graphile": {
    "preset": {
      "gather": {
        "pgScopedIntrospection": {
          "main": {
            "catalogTypes": "dependency-closure",
            "capabilityExtensions": ["pg_trgm"]
          }
        }
      }
    }
  }
}
```

## When to Use

- Use `@constructive-io/graphql-env` for Constructive applications that need GraphQL/Graphile configuration
- Use `@pgpmjs/env` for pure PGPM tooling that doesn't need GraphQL support
