# graphile-pg-type-mappings

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-pg-type-mappings">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-pg-type-mappings%2Fpackage.json"/>
  </a>
</p>

**`graphile-pg-type-mappings`** is a Graphile/PostGraphile plugin that maps custom PostgreSQL types to GraphQL scalars.

## 🚀 Installation

```bash
npm install graphile-pg-type-mappings
```

## ✨ Features

- Sensible defaults for common custom Postgres types (`email`, `origin`, `multiple_select`, etc.)
- Override or extend mappings via `customTypeMappings`
- Works with PostGraphile v4 as a standard plugin
- TypeScript definitions for mapping configuration

### Default mappings

- `email` → `String`
- `hostname` → `String`
- `multiple_select` → `JSON`
- `single_select` → `JSON`
- `origin` → `String`
- `url` → `String`

> **Note:** If you need PostGIS types (like `geolocation` or `geopolygon` → `GeoJSON`), you can add them via `customTypeMappings` when using the PostGIS plugin.

## 📦 Usage

### Basic Usage (Default Mappings)

```typescript
import CustomPgTypeMappingsPlugin from 'graphile-pg-type-mappings';

const postgraphileOptions = {
  appendPlugins: [CustomPgTypeMappingsPlugin],
  // ... other options
};
```

### Custom Type Mappings

You can override default mappings or add new ones by passing options through `graphileBuildOptions`:

```typescript
import CustomPgTypeMappingsPlugin from 'graphile-pg-type-mappings';

const postgraphileOptions = {
  appendPlugins: [CustomPgTypeMappingsPlugin],
  graphileBuildOptions: {
    customTypeMappings: [
      // Add a new custom type mapping
      { name: 'my_custom_type', namespaceName: 'public', type: 'JSON' },
      // Override an existing mapping (email -> JSON instead of String)
      { name: 'email', namespaceName: 'public', type: 'JSON' }
    ]
  },
  // ... other options
};
```

### Type Mapping Format

Each type mapping has the following structure:

```typescript
interface TypeMapping {
  name: string;           // PostgreSQL type name
  namespaceName: string;  // PostgreSQL schema/namespace name (e.g., 'public')
  type: string;           // GraphQL type name (e.g., 'String', 'JSON', 'GeoJSON')
}
```

### Examples

#### Adding a Custom Type

```typescript
const postgraphileOptions = {
  appendPlugins: [CustomPgTypeMappingsPlugin],
  graphileBuildOptions: {
    customTypeMappings: [
      { name: 'currency', namespaceName: 'public', type: 'String' },
      { name: 'metadata', namespaceName: 'public', type: 'JSON' }
    ]
  }
};
```

#### Overriding Default Mappings

```typescript
const postgraphileOptions = {
  appendPlugins: [CustomPgTypeMappingsPlugin],
  graphileBuildOptions: {
    customTypeMappings: [
      // Override email to map to JSON instead of String
      { name: 'email', namespaceName: 'public', type: 'JSON' }
    ]
  }
};
```

#### Using Only Custom Mappings (No Defaults)

If you want to use only your custom mappings without the defaults, you can create a wrapper:

```typescript
import CustomPgTypeMappingsPlugin, { TypeMapping } from 'graphile-pg-type-mappings';

const MyCustomPlugin = (builder: any) => {
  return CustomPgTypeMappingsPlugin(builder, {
    customTypeMappings: [
      { name: 'my_type', namespaceName: 'public', type: 'String' }
    ]
  });
};

const postgraphileOptions = {
  appendPlugins: [MyCustomPlugin],
  // ... other options
};
```

## 📘 API

### `CustomPgTypeMappingsPlugin`

The default export is a Graphile plugin that can be used directly or with custom options.

### `TypeMapping`

```typescript
interface TypeMapping {
  name: string;
  namespaceName: string;
  type: string;
}
```

### `CustomPgTypeMappingsPluginOptions`

```typescript
interface CustomPgTypeMappingsPluginOptions {
  customTypeMappings?: TypeMapping[];
}
```

## 🧪 Testing

```sh
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-pg-type-mappings test
```
