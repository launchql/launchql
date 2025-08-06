\echo Use "CREATE EXTENSION launchql-geo-types" to load this file. \quit
CREATE DOMAIN geolocation AS geometry(point, 4326);

COMMENT ON DOMAIN geolocation IS E'@name launchqlInternalTypeGeoLocation';

CREATE DOMAIN geopolygon AS geometry(polygon, 4326);

COMMENT ON DOMAIN geopolygon IS E'@name launchqlInternalTypeGeoPolygon';