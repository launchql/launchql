# @launchql/types

GraphQL/Graphile types for the LaunchQL framework.

This package contains TypeScript type definitions for PostGraphile/Graphile configuration used by LaunchQL server, explorer, and related packages.

## Installation

```bash
npm install @launchql/types
```

## Usage

```typescript
import { 
  LaunchQLOptions, 
  GraphileOptions, 
  ApiOptions, 
  GraphileFeatureOptions,
  launchqlDefaults 
} from '@launchql/types';

// LaunchQLOptions extends PgpmOptions with GraphQL configuration
const config: LaunchQLOptions = {
  graphile: {
    schema: ['public', 'app_public'],
    appendPlugins: [],
  },
  api: {
    enableMetaApi: true,
    exposedSchemas: ['public'],
  },
  features: {
    simpleInflection: true,
    postgis: true,
  },
};
```

## Types

### LaunchQLOptions

Full configuration options for LaunchQL framework, extending `PgpmOptions` with GraphQL/Graphile configuration.

### GraphileOptions

PostGraphile/Graphile configuration including schema, plugins, and build options.

### ApiOptions

Configuration for the LaunchQL API including meta API settings, exposed schemas, and role configuration.

### GraphileFeatureOptions

Feature flags for GraphQL/Graphile including inflection settings and PostGIS support.

## Re-exports

This package re-exports all types from `@pgpmjs/types` for convenience, so you can import both core PGPM types and GraphQL types from a single package.
