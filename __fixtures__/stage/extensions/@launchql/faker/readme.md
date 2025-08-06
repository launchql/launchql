# faker [![Build Status](https://travis-ci.com/pyramation/faker.svg?branch=master)](https://travis-ci.com/pyramation/faker)

create fake data in PostgreSQL

# Usage

## state, city, zip

```sql
select faker.state();
-- CA

select faker.city();
-- Belle Haven

select faker.city('MI');
-- Livonia

select faker.zip();
-- 48105

select faker.zip('Los Angeles');
-- 90272
```

## address, street

```sql
select faker.address();
-- 762 MESA ST         
-- Fort Mohave, AZ 86427

select faker.address('MI');
-- 2316 LAPHAM WAY           
-- Sterling Heights, MI 48312

select faker.street();
-- CLAY ST
```

## tags

Tags can be seeded in `faker.dictionary` table, here's an example with sustainability 

```sql
select faker.tags();
-- {"causes of global warming","electronic waste","solar powered cars"}
```

## words

```sql
select faker.word();
-- woodpecker
```

Specify word types

```sql
select faker.word(ARRAY['adjectives']);
-- decisive
```

## paragraphs

```sql
select faker.paragraph();
-- Ligula. Aliquet torquent consequat egestas dui. Nullam sed tincidunt mauris porttitor ad taciti rutrum eleifend. Phasellus.
```

## email

```sql
select faker.email();
-- crimson79@hotmail.com
```

## uuid

```sql
select faker.uuid();
-- 327cb21d-1680-47ee-9979-3689e1bcb9ab
```

## tokens, passwords

```sql
select faker.token();
-- 9e23040a7825529beb1528c957eac73f

select faker.token(20);
-- 7504ef4eafbba04a9645198b10ebc9616afce13a

select faker.password();
-- d8f1cca306e4d7^15bb(62618c1e
```

## hostname

```sql
select faker.hostname();
-- fine.net
```

## time unit

```sql
select faker.time_unit();
-- hour
```

## float

```sql
select faker.float();
-- 64.6970694223782

select faker.float(2.3,10.5);
-- 10.233102884792025
```

## integer

```sql
select faker.integer();
-- 8

select faker.integer(2,10);
-- 7
```

## date

```sql
select faker.date();
-- 2020-10-02
```

Date 1-3 days ago

```sql
select faker.date(1,3);
-- 2020-12-02
```

Date in the future between 1-3 days

```sql
select faker.date(1,3, true);
-- 2020-12-06
```

## birthdate

```sql
select faker.birthdate();
-- 2007-02-24
```

Generate birthdate for somebody who is between age of 37 and 64

```sql
select faker.birthdate(37, 64);
-- 1972-08-10
```

## interval

```sql
select faker.interval();
-- 00:01:34.959831
```

Generate an interval between 2 and 300 seconds

```sql
select faker.interval(2,300);
-- 00:01:04
```

## gender

```sql
select faker.gender();
-- F

select faker.gender();
-- M
```

## boolean

```sql
select faker.boolean();
-- TRUE
```

## timestamptz

```sql
select faker.timestamptz();
-- 2019-12-20 15:57:29.520365+00
```

Future timestamptz

```sql
select faker.timestamptz(TRUE);
-- 2020-12-03 23:00:10.013301+00
-- 
```

## mime types

```sql
select faker.mime();
-- text/x-scss
```

## file extensions

```sql
select faker.ext();
-- html
```

Specify a mimetype

```sql
select faker.ext('image/png');
-- png
```

Image mimetypes

```sql
select faker.image_mime();
-- image/gif
```

## image

```sql
select faker.image();
-- {"url": "https://picsum.photos/843/874", "mime": "image/gif"}
```

## profilepic

credit: thank you https://randomuser.me 

```sql
select faker.profilepic();
-- {"url": "https://randomuser.me/api/portraits/women/53.jpg", "mime": "image/jpeg"}
```

Specify a gender

```sql
select faker.profilepic('M');
-- {"url": "https://randomuser.me/api/portraits/men/4.jpg", "mime": "image/jpeg"}
```

## file

```sql
select faker.file();
-- scarlet.jpg
```

Specify a mimetype

```sql
select faker.file('image/png');
-- anaconda.png
```

## url

```sql
select faker.url();
-- https://australian.io/copper.gzip
```

## upload

```sql
select faker.upload();
-- https://magenta.co/moccasin.yaml
```

## attachment

```sql
select faker.attachment();
--  {"url": "https://silver.io/sapphire.jsx", "mime": "text/jsx"}
```

## phone

```sql
select faker.phone();
-- +1 (121) 617-3329
```

## ip

```sql
select faker.ip();
-- 42.122.9.119
```

## username

```sql
select faker.username();
-- amaranth28
```

## name

```sql
select faker.name();
-- Lindsay
```

Specify a gender

```sql
select faker.name('M');
-- Stuart

select faker.name('F');
-- Shelly
```

## surname

```sql
select faker.surname();
-- Smith
```

## fullname

```sql
select faker.fullname();
-- Ross Silva

select faker.fullname('M');
-- George Spencer
```

## business

```sql
select faker.business();
-- Seed Partners, Co.
```

## longitude / latitude coordinates

```sql
select faker.lnglat( -118.561721, 33.59, -117.646374, 34.23302 );
-- (-118.33162189532844,34.15614699957491)

select faker.lnglat();
-- (-74.0205,40.316)
```

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
