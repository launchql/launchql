# graphile-i18n [![Build Status](https://travis-ci.com/pyramation/graphile-i18n.svg?branch=master)](https://travis-ci.com/pyramation/graphile-i18n)

```sh
npm install graphile-i18n 
```

This [PostGraphile](http://postgraphile.org/) schema plugin was built to enable i18n language translation tables.

## Usage

1. Create a language translation table
2. Add smart comments
3. Register plugin with postgraphile

## language table

Add language table with `lang_code` field and a smart comment for `i18n`:

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
    UNIQUE(project_id, lang_code)
);
```

## Register Plugin

```js
app.use(
  postgraphile(connectionStr, schemas, {
    appendPlugins: [
      LangPlugin
    ],
    graphileBuildOptions: {
      langPluginDefaultLanguages: ['en']
    }
  })
);
```

## testing

```
createdb test_database
psql test_database < sql/roles.sql
psql test_database < sql/test.sql 
yarn test
```