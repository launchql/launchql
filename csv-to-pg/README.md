# csv-to-pg ![Build Status](https://travis-ci.org/pyramation/csv-to-pg.svg?branch=master)

Create PostgreSQL statements from CSV files

## Installation

```sh
npm install -g csv-to-pg
```

## Usage

The idea for this library was to solve complex CSV scenarios, so currently each CSV requires a config file. 

### config

Here is an example of a config.yaml that we can use to parse a csv that has no headers, and uses tab-delimited elements:

```yaml
input: "./myfile.tsv"
output: "./myfile.sql"
schema: myschema
table: mytable
delimeter: "\t"
headers:   # order of the headers
  - feature
  - category
  - days
  - start
  - end
fields:
  feature: text
  category: text
  days: int
  start: date
  end:
    type: date
    cast: date  # explicitly cast to a date type
```

You can also use JS files or JSON. If you use JS, you can also create ASTs for super custom inserts (read tests).

### run it!

Once you have a config file, simply call it and point to the config:

```sh
csv2pg ./config.yaml
```