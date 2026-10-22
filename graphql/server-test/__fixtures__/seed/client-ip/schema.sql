-- Client-IP fixture: one query that echoes the `jwt.claims.ip_address`
-- pgSetting the server set for this transaction, so a test can see which
-- address a request was attributed to in the database.
--
-- Compose after app-schemas/simple-pets/schema.sql and scoped/test-data.sql.

CREATE FUNCTION "simple-pets-public".request_client_ip()
RETURNS text AS $$
  SELECT nullif(current_setting('jwt.claims.ip_address', true), '');
$$ LANGUAGE sql STABLE;
