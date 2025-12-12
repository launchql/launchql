-- Deploy schemas/public/domains/geopolygon to pg

-- requires: schemas/public/schema

BEGIN;

CREATE DOMAIN geopolygon AS geometry (Polygon, 4326);
COMMENT ON DOMAIN geopolygon IS E'@name launchqlInternalTypeGeoPolygon';

COMMIT;