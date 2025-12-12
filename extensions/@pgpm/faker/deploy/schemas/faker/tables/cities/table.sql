-- Deploy schemas/faker/tables/cities/table to pg

-- requires: schemas/faker/schema

BEGIN;

CREATE TABLE faker.cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  city text,
  state text,
  zips int[],
  lat float,
  lng float
);


CREATE INDEX faker_city_idx1 ON faker.cities (
  city
);

CREATE INDEX faker_city_idx2 ON faker.cities (
  state
);

CREATE INDEX faker_city_idx3 ON faker.cities USING GIN (
  zips
);

COMMIT;
