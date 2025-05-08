-- Deploy schemas/public/domains/geolocation to pg

-- requires: schemas/public/schema

BEGIN;

CREATE DOMAIN geolocation AS geometry (Point, 4326);
COMMENT ON DOMAIN geolocation IS E'@name launchqlInternalTypeGeoLocation';

COMMIT;
