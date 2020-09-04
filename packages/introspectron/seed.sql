BEGIN;
CREATE SCHEMA app_public;
CREATE TABLE app_public.merchants (
    id serial PRIMARY KEY,
    name text NOT NULL
);
CREATE TABLE app_public.products (
    id serial PRIMARY KEY,
    merchant_id bigint REFERENCES app_public.merchants (id),
    name text NOT NULL,
    description text,
    price numeric
);
CREATE TABLE app_public.users (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);
COMMIT;

