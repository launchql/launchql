# inflection [![Build Status](https://travis-ci.com/pyramation/inflection.svg?branch=master)](https://travis-ci.com/pyramation/inflection)

inflection is a port of the functionality from Ruby on Rails' Active Support Inflection classes into PostgreSQL

# Usage

```sql
select inflection.plural( 'child' );
-- children

select inflection.singular( 'children' );
-- child

select inflection.camel( 'message_properties' );
-- messageProperties

select inflection.pascal( 'web acl' );
-- WebAcl

select inflection.underscore( 'WebACL' );
-- web_acl
```

# credits

Thanks to 

https://github.com/dreamerslab/node.inflection


# Development

## start the postgres db process

First you'll want to start the postgres docker (you can also just use `docker-compose up -d`):

```sh
make up
```

## install modules

Install modules

```sh
yarn install
```

## install the Postgres extensions

Now that the postgres process is running, install the extensions:

```sh
make install
```

This basically `ssh`s into the postgres instance with the `packages/` folder mounted as a volume, and installs the bundled sql code as pgxn extensions.

## testing

Testing will load all your latest sql changes and create fresh, populated databases for each sqitch module in `packages/`.

```sh
yarn test:watch
```

## building new modules

Create a new folder in `packages/`

```sh
lql init
```

Then, run a generator:

```sh
lql generate
```

You can also add arguments if you already know what you want to do:

```sh
lql generate schema --schema myschema
lql generate table --schema myschema --table mytable
```

## deploy code as extensions

`cd` into `packages/<module>`, and run `lql package`. This will make an sql file in `packages/<module>/sql/` used for `CREATE EXTENSION` calls to install your sqitch module as an extension.

## recursive deploy

You can also deploy all modules utilizing versioning as sqtich modules. Remove `--createdb` if you already created your db:

```sh
lql deploy awesome-db --yes --recursive --createdb
```
