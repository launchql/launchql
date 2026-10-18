import 'graphile-build-pg';

import type { PgCodec } from '@dataplan/pg';
import type { GraphileConfig } from 'graphile-config';
import type { SQL } from 'pg-sql2';
import sql from 'pg-sql2';

import { GIS_SUBTYPE_NAME } from '../constants';
import type { GisFieldValue } from '../types';
import { getGISTypeDetails } from '../utils';

/**
 * Map from PostGIS uppercase geometry type names (from geometrytype()) to
 * our mixed-case format used by resolveType lookups.
 *
 * PostGIS `geometrytype()` returns uppercase: 'POINT', 'POINTZ', 'MULTIPOLYGON', etc.
 * Our GIS_SUBTYPE_NAME uses mixed case: 'Point', 'LineString', 'MultiPolygon', etc.
 * The getGISTypeName() utility produces: 'Point', 'PointZ', 'MultiPolygonZM', etc.
 */
const GIS_TYPE_NORMALIZE: Record<string, string> = {
  POINT: 'Point',
  POINTZ: 'PointZ',
  POINTM: 'PointM',
  POINTZM: 'PointZM',
  LINESTRING: 'LineString',
  LINESTRINGZ: 'LineStringZ',
  LINESTRINGM: 'LineStringM',
  LINESTRINGZM: 'LineStringZM',
  POLYGON: 'Polygon',
  POLYGONZ: 'PolygonZ',
  POLYGONM: 'PolygonM',
  POLYGONZM: 'PolygonZM',
  MULTIPOINT: 'MultiPoint',
  MULTIPOINTZ: 'MultiPointZ',
  MULTIPOINTM: 'MultiPointM',
  MULTIPOINTZM: 'MultiPointZM',
  MULTILINESTRING: 'MultiLineString',
  MULTILINESTRINGZ: 'MultiLineStringZ',
  MULTILINESTRINGM: 'MultiLineStringM',
  MULTILINESTRINGZM: 'MultiLineStringZM',
  MULTIPOLYGON: 'MultiPolygon',
  MULTIPOLYGONZ: 'MultiPolygonZ',
  MULTIPOLYGONM: 'MultiPolygonM',
  MULTIPOLYGONZM: 'MultiPolygonZM',
  GEOMETRYCOLLECTION: 'GeometryCollection',
  GEOMETRYCOLLECTIONZ: 'GeometryCollectionZ',
  GEOMETRYCOLLECTIONM: 'GeometryCollectionM',
  GEOMETRYCOLLECTIONZM: 'GeometryCollectionZM'
};

/**
 * Normalize the __gisType from PostGIS uppercase to our mixed-case format.
 * Falls back to the raw value if not in the map.
 */
function normalizeGisType(raw: string): string {
  return GIS_TYPE_NORMALIZE[raw] ?? raw;
}

function getGeometrySubtypeName(typmod: number): string | null {
  const { subtype } = getGISTypeDetails(typmod);
  const subtypeName = GIS_SUBTYPE_NAME[subtype];
  return subtypeName && subtypeName !== 'Geometry' ? subtypeName : null;
}

/**
 * Scalar PgCodec for PostGIS geometry/geography types.
 *
 * TFromPostgres = string (PG sends text via ::text cast)
 * TFromJavaScript = GisFieldValue (our parsed object with __gisType, __srid, __geojson)
 *
 * Note: PgCodec uses TFromJavaScript for both fromPg output AND toPg input.
 * For PostGIS, toPg actually receives raw GeoJSON input (not GisFieldValue),
 * but the PgCodec interface constrains both to the same type. At runtime,
 * toPg handles both cases via JSON.stringify.
 */
type GisScalarCodec = PgCodec<
  string,        // TName
  undefined,     // TAttributes (scalar, no record attributes)
  string,        // TFromPostgres
  GisFieldValue, // TFromJavaScript
  undefined,     // TArrayItemCodec
  undefined,     // TDomainItemCodec
  undefined      // TRangeItemCodec
>;

/**
 * Build a codec for a PostGIS geometry or geography type.
 *
 * The codec:
 * - castFromPg: wraps the SQL column in json_build_object() with __gisType,
 *   __srid, and __geojson fields (using PostGIS functions ST_SRID, ST_AsGeoJSON,
 *   geometrytype). This replaces the default ::text cast.
 * - fromPg: parses the JSON text result and normalizes __gisType case.
 * - toPg: converts GeoJSON input back to a PostGIS-compatible value using
 *   ST_GeomFromGeoJSON.
 */
function buildGisCodec(
  typeName: 'geometry' | 'geography',
  schemaName: string,
  typeOid: string,
  serviceName: string
): GisScalarCodec {
  return {
    name: typeName,
    sqlType: sql.identifier(schemaName, typeName),

    /**
     * castFromPg replaces the default `::text` cast. PostGraphile calls this
     * to determine the SQL expression for selecting the column value.
     *
     * We wrap in json_build_object() so the result contains:
     * - __gisType: geometry subtype name (e.g. "POINT", "POLYGON")
     * - __srid: spatial reference ID
     * - __geojson: the GeoJSON representation
     *
     * The result is cast to ::text so PostgreSQL sends it as a string,
     * which fromPg then JSON.parses.
     */
    // NOTE: `fragment` is evaluated 4 times in the SQL. This is acceptable because
    // PostGraphile v5 always passes simple column references here.
    // If this changes, consider wrapping in a LATERAL subexpression.
    castFromPg(fragment: SQL): SQL {
      return sql.fragment`(case when (${fragment}) is null then null else json_build_object(
        '__gisType', ${sql.identifier(schemaName, 'geometrytype')}(${fragment}),
        '__srid', ${sql.identifier(schemaName, 'st_srid')}(${fragment}),
        '__geojson', ${sql.identifier(schemaName, 'st_asgeojson')}(${fragment})::json
      )::text end)`;
    },

    /**
     * fromPg receives the text value from PostgreSQL (output of castFromPg)
     * and converts it to a JavaScript object.
     *
     * If castFromPg is working correctly, the value is always valid JSON.
     * We normalize __gisType from PostGIS uppercase to our mixed-case format.
     */
    fromPg(value: string): GisFieldValue {
      let parsed: any;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        throw new Error(
          `Failed to parse PostGIS geometry value: ${e instanceof Error ? e.message : String(e)}. ` +
          `Raw value (first 200 chars): ${String(value).slice(0, 200)}`
        );
      }
      if (parsed && typeof parsed === 'object' && parsed.__gisType) {
        parsed.__gisType = normalizeGisType(parsed.__gisType);
      }
      return parsed;
    },

    /**
     * toPg serializes a JavaScript value for insertion into PostgreSQL.
     * Accepts GeoJSON objects and converts them to a JSON string that
     * PostgreSQL can process via ST_GeomFromGeoJSON.
     */
    toPg(value: GisFieldValue): string {
      if (value && typeof value === 'object' && '__geojson' in value) {
        return JSON.stringify(value.__geojson);
      }
      return JSON.stringify(value);
    },

    attributes: undefined,
    executor: undefined,
    extensions: {
      oid: typeOid,
      pg: {
        serviceName,
        schemaName,
        name: typeName
      }
    }
  };
}

/**
 * PostgisCodecPlugin
 *
 * Teaches PostGraphile v5 how to handle PostgreSQL's geometry and geography types.
 *
 * This plugin:
 * 1. Creates codecs for geometry/geography via gather.hooks.pgCodecs_findPgCodec
 * 2. The registered codecs use castFromPg to wrap geometry values in
 *    json_build_object() with __gisType, __srid, __geojson metadata
 * 3. fromPg normalizes the geometry type names for resolveType lookups
 *
 * Without castFromPg, PostGraphile defaults to `column::text` which returns
 * WKB hex — unusable for GraphQL. The json_build_object wrapper provides
 * structured metadata that downstream plugins use for type resolution and
 * field values (x/y coordinates, GeoJSON, SRID, etc.).
 */
export const PostgisCodecPlugin: GraphileConfig.Plugin = {
  name: 'PostgisCodecPlugin',
  version: '2.0.0',
  description: 'Registers codecs for PostGIS geometry and geography types',

  gather: {
    hooks: {
      async pgCodecs_findPgCodec(info, event) {
        const { pgType: type, serviceName } = event;

        if (type.typname !== 'geometry' && type.typname !== 'geography') {
          return;
        }

        // Find the namespace for this type by its OID
        const typeNamespace = await info.helpers.pgIntrospection.getNamespace(
          serviceName,
          type.typnamespace
        );

        if (!typeNamespace) {
          throw new Error(
            `[graphile-postgis] Cannot resolve namespace for ${type.typname} ` +
            `codec in service '${serviceName}'`
          );
        }

        if (event.pgCodec) {
          const existingPg = event.pgCodec.extensions?.pg;
          if (
            (existingPg?.serviceName && existingPg.serviceName !== serviceName) ||
            (existingPg?.schemaName && existingPg.schemaName !== typeNamespace.nspname)
          ) {
            throw new Error(
              `[graphile-postgis] Existing ${type.typname} codec identity conflicts ` +
              `with introspection for service '${serviceName}'`
            );
          }
          const existingCodec = event.pgCodec as any;
          existingCodec.sqlType = sql.identifier(typeNamespace.nspname, type.typname);
          existingCodec.extensions = {
            ...existingCodec.extensions,
            oid: type._id,
            pg: {
              ...existingPg,
              serviceName,
              schemaName: typeNamespace.nspname,
              name: type.typname,
            },
          };
          return;
        }

        // We look for geometry/geography types in any schema (PostGIS can be
        // installed in different schemas, commonly 'public' or 'postgis')
        if (type.typname === 'geometry') {
          event.pgCodec = buildGisCodec(
            'geometry',
            typeNamespace.nspname,
            type._id,
            serviceName
          );
          return;
        }

        if (type.typname === 'geography') {
          event.pgCodec = buildGisCodec(
            'geography',
            typeNamespace.nspname,
            type._id,
            serviceName
          );
          return;
        }
      },

      /**
       * Annotate geometry/geography attributes with their subtype (Point,
       * Polygon, LineString, etc.) decoded from the PostgreSQL type modifier.
       *
       * The atttypmod encodes subtype + SRID + Z/M flags. We decode it with
       * getGISTypeDetails() and store the human-readable subtype name on
       * attribute.extensions.geometrySubtype so the _meta plugin can expose it.
       */
      async pgCodecs_attribute(_info, event) {
        const { pgAttribute, attribute } = event;
        const codecName = attribute.codec?.name;
        if (codecName !== 'geometry' && codecName !== 'geography') {
          return;
        }

        const typmod = pgAttribute.atttypmod;
        // atttypmod of -1 or null means no modifier (unconstrained geometry)
        if (typmod == null || typmod === -1) {
          return;
        }

        try {
          const subtypeName = getGeometrySubtypeName(typmod);
          if (subtypeName) {
            if (!attribute.extensions) {
              attribute.extensions = {};
            }
            (attribute.extensions as Record<string, unknown>).geometrySubtype = subtypeName;
          }
        } catch {
          // If the modifier can't be decoded, silently skip — the column
          // will still work, just without subtype info in _meta.
        }
      }
    }
  }
};
