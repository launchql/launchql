# graphile-settings

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-settings"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-settings%2Fpackage.json"/></a>
</p>

**`graphile-settings`** is a batteries-included configuration builder for [PostGraphile](https://www.graphile.org/postgraphile/), purpose-built for the [LaunchQL](https://github.com/launchql/launchql) ecosystem. It centralizes plugin setup, schema wiring, and feature flags into a single, composable interface — enabling consistent, high-performance GraphQL APIs across projects.

## 🚀 Installation

```bash
npm install graphile-settings
```

## ✨ Features

* Built-in support for:

  * ✅ Connection filters
  * 🔍 Full-text search
  * 🌍 PostGIS support (with filters)
  * 🧩 Many-to-many helpers
  * 🆎 Simplified inflectors
  * 🗂 Upload field support (S3/MinIO)
  * 🌐 i18n support via `graphile-i18n`
  * 🧠 Meta schema plugin
  * 🔎 Graphile search plugin
* Smart schema and plugin configuration via environment or options
* Express-compatible with support for request-aware context

## 📦 Usage

```ts
import { getGraphileSettings } from 'graphile-settings';
import { postgraphile } from 'postgraphile';
import express from 'express';

const app = express();

const settings = getGraphileSettings({
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictAuth: true,
  },
  graphile: {
    schema: ['app_public'],
    metaSchemas: ['meta_public'],
  },
  features: {
    postgis: true,
    simpleInflection: true,
    oppositeBaseNames: true,
  },
  cdn: {
    bucketName: 'media-bucket',
    awsRegion: 'us-west-1',
    awsAccessKey: 'AKIA...',
    awsSecretKey: 'secret',
    minioEndpoint: 'http://localhost:9000'
  }
});

app.use(postgraphile({
  ...settings,
  pgPool: myPool // your initialized pg.Pool
}));

app.listen(settings.port);
```

## 🧰 Configuration Options

### `LaunchQLOptions`

#### `server`

* `port` — (number) Port to use
* `host` — (string) Hostname
* `trustProxy` — (boolean) Whether to trust proxy headers (e.g. for real IPs)
* `origin` — (string) Origin for CORS/auth logic
* `strictAuth` — (boolean) Whether to enforce strict auth

#### `graphile`

* `schema` — (string or string\[]) Required list of main GraphQL schemas
* `metaSchemas` — (string\[]) Optional list of meta/introspection schemas
* `isPublic` — (boolean) Flag for public GraphQL instance
* `appendPlugins` — (Plugin\[]) Additional Graphile plugins
* `graphileBuildOptions` — (PostGraphileOptions.graphileBuildOptions) Extra build options
* `overrideSettings` — (Partial<PostGraphileOptions>) Manual overrides of generated config

#### `features`

* `simpleInflection` — Use simplified inflection (e.g. `fooByBarId`)
* `oppositeBaseNames` — Enable smart reverse relation names
* `postgis` — Enable PostGIS and filter plugin

#### `cdn`

* `bucketName` — Required for upload plugin (S3 or MinIO)
* `awsRegion` — AWS region
* `awsAccessKey` — Access key for upload
* `awsSecretKey` — Secret key
* `minioEndpoint` — Optional override for MinIO compatibility

## 🔌 Included Plugins

* `graphile-plugin-connection-filter`
* `graphile-plugin-fulltext-filter`
* `graphile-postgis`
* `postgraphile-plugin-connection-filter-postgis`
* `postgraphile-derived-upload-field`
* `graphile-simple-inflector`
* `graphile-i18n`
* `graphile-meta-schema`
* `@graphile-contrib/pg-many-to-many`
* `graphile-search-plugin`
* `graphile-pg-type-mappings`
