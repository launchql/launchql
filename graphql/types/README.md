# @constructive-io/graphql-types

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@constructive-io/graphql-types"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphql%2Ftypes%2Fpackage.json"/></a>
</p>

GraphQL/Graphile types for the Constructive framework.

This package contains TypeScript type definitions for PostGraphile/Graphile configuration used by Constructive server, explorer, and related packages.

## Installation

```bash
npm install @constructive-io/graphql-types
```

## Usage

```typescript
import { 
  ConstructiveOptions, 
  GraphileOptions, 
  ApiOptions, 
  GraphileFeatureOptions,
  constructiveDefaults 
} from '@constructive-io/graphql-types';

// ConstructiveOptions extends PgpmOptions with GraphQL configuration
const config: ConstructiveOptions = {
  graphile: {
    schema: ['public', 'app_public'],
    appendPlugins: [],
  },
  api: {
    exposedSchemas: ['public'],
  },
  features: {
    simpleInflection: true,
    postgis: true,
  },
};
```

## Types

### ConstructiveOptions

Full configuration options for Constructive framework, extending `PgpmOptions` with GraphQL/Graphile configuration.

### GraphileOptions

PostGraphile/Graphile configuration including schema, plugins, and build options.

### ApiOptions

Configuration for the Constructive API including meta API settings, exposed schemas, and role configuration.

### GraphileFeatureOptions

Feature flags for GraphQL/Graphile including inflection settings and PostGIS support.

## Re-exports

This package re-exports all types from `@pgpmjs/types` for convenience, so you can import both core PGPM types and GraphQL types from a single package.
