# graphile-i18n

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-i18n">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-i18n%2Fpackage.json"/>
  </a>
</p>

TypeScript rewrite of the Graphile/PostGraphile i18n plugin. Adds language-aware fields sourced from translation tables declared via smart comments.

## Install

```bash
pnpm add graphile-i18n
```

## Usage

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

## Tests

Tests run against a real Postgres instance using `graphile-test`:

```bash
pnpm test
```

Ensure Postgres is available at `postgres://postgres:password@localhost:5432`.
