# graphile-i18n

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
  <a href="https://www.npmjs.com/package/graphile-i18n">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-i18n%2Fpackage.json"/>
  </a>
</p>

**`graphile-i18n`** is a TypeScript rewrite of the Graphile/PostGraphile i18n plugin. It adds language-aware fields sourced from translation tables declared via smart comments and respects `Accept-Language` with sensible fallbacks.

## 🚀 Installation

```bash
pnpm add graphile-i18n
```

## ✨ Features

- Smart comments (`@i18n`) to wire translation tables
- `Accept-Language` detection with graceful fallback to base values
- Works with PostGraphile context via `additionalGraphQLContextFromRequest`
- TypeScript-first implementation

## 📦 Usage

1. Add a translation table and tag the base table with `@i18n`:

```sql
CREATE TABLE app_public.projects (
  id serial PRIMARY KEY,
  name citext,
  description citext
);
COMMENT ON TABLE app_public.projects IS E'@i18n project_language_variations';

CREATE TABLE app_public.project_language_variations (
  id serial PRIMARY KEY,
  project_id int NOT NULL REFERENCES app_public.projects(id),
  lang_code citext,
  name citext,
  description citext,
  UNIQUE (project_id, lang_code)
);
```

2. Register the plugin:

```ts
import express from 'express';
import { postgraphile } from 'postgraphile';
import {
  LangPlugin,
  additionalGraphQLContextFromRequest,
} from 'graphile-i18n';

const app = express();
app.use(
  postgraphile(process.env.DATABASE_URL, ['app_public'], {
    appendPlugins: [LangPlugin],
    graphileBuildOptions: {
      langPluginDefaultLanguages: ['en'],
    },
    additionalGraphQLContextFromRequest,
  })
);
```

Requests with `Accept-Language` headers receive the closest translation; fields fall back to the base table values when a translation is missing.

## 🧰 Configuration Options

All options are provided through `graphileBuildOptions`:

- `langPluginLanguageCodeColumn` — translation table column name, default `lang_code`
- `langPluginLanguageCodeGqlField` — exposed GraphQL field name, default `langCode`
- `langPluginAllowedTypes` — allowed base column types for translation, default `['citext', 'text']`
- `langPluginDefaultLanguages` — fallback language order, default `['en']`

## 🧪 Testing

```sh
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-i18n test
```
