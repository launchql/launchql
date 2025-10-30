# skitch

[![Build Status](https://travis-ci.org/pyramation/skitch.svg?branch=master)](https://travis-ci.org/pyramation/skitch)

Create PostgreSQL sql code quickly and in a streamlined, versioned workflow.

`skitch` is a wrapper around `sqitch` to enable a sane workflow for sane database management.

* write and deploy extensions that can be installed with `CREATE EXTENSION`
* optionally deploy same source as `sqitch` modules (since some managed db providers don't allow custom extensions)
* write/deploy a project full of many `sqitch` modules that cross-reference each other using dependency resolution for running deploy command in proper order, etc
* pulling modules down (currently via npm) to make re-usability super easy

## installation

#### Install `psql`

Install `psql` without actually running the database. On mac you can use

`brew install libpq`

Or you can install the full-blown postgres locally, but it is recommended that you shut the service down. You'll be using `psql` to connect to the postgres that runs inside of a docker container.

#### Install sqitch

https://sqitch.org/
mac users can use brew: https://github.com/sqitchers/homebrew-sqitch

#### Install the Template library from http://www.tt2.org/

```sh
sudo cpan Template
```

#### Install `skitch` globally

```sh
npm install -g skitch
```

#### Get the verification utils

https://github.com/pyramation/pg-utils

## getting started

Initialize a project

```sh
skitch init --bare
skitch install
```

Now you should have a `packages/` folder

```sh
cd packages/
mkdir myfirstmodule
cd myfirstmodule/
skitch init
```

Now you can create some `sql` using `sqitch`!

```sh
skitch generate schema
skitch generate table
```

Deploy recursively, using all the required modules!

```sh
skitch deploy --createdb --recursive
```

## testing

To create a test, first cd into a sqitch module

```sh
cd packages/myfirstmodule
skitch maketest
```

Then you can use `jest` via `pnpm` to test your logic.

```sh
pnpm test:watch
```

## what's different

* interactive shell
* naming conventions
* utility functions to create verify/revert functions for most types
* bundled with templates for most common things:

```
column
extension
fixture
foreignKey
grantAllTables
grantExecute
grantRole
grantSchema
grantTable
index
policy
procedure
role
rowLevelSecurity
schema
table
timestamps
trigger
type
uniqueIndex
utility
```

## bundle an npm module

You can install an npm module and then bundle it for `plv8`

```sh
pnpm add my-awesome-npm-module
skitch bundle my-awesome-npm-module awesomeThing
```

## Install some existing packages

```sh
skitch install skitch-extension-verify
skitch install skitch-extension-jobs
```
