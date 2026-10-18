import type { PgCodec } from '@dataplan/pg';
import type { Geometry } from 'geojson';
import type { GraphQLInterfaceType, GraphQLObjectType } from 'graphql';
import type { SQL } from 'pg-sql2';

import type { GisSubtype } from './constants';

export interface GisTypeDetails {
  subtype: GisSubtype;
  hasZ: boolean;
  hasM: boolean;
  srid: number;
}

export interface GisFieldValue {
  __gisType: string;
  __srid: number;
  __geojson: Geometry;
}

/**
 * PostGIS extension detection result stored on the build object.
 */
export interface PostgisExtensionInfo {
  /** Exact Graphile PostgreSQL service that owns these codecs. */
  serviceName: string;
  /** The schema name where PostGIS is installed (e.g. 'public') */
  schemaName: string;
  /** The geometry codec from the registry (null if only geography columns are used) */
  geometryCodec: PgCodec | null;
  /** The geography codec from the registry (null if only geometry columns are used) */
  geographyCodec: PgCodec | null;
}

/**
 * Module augmentations for PostGraphile v5 types.
 *
 * These declare the custom properties that our PostGIS plugins add to the
 * build object, inflection, and scope interfaces. This allows downstream
 * code (including our own plugins) to use these properties without `any` casts.
 */
declare global {
  namespace GraphileBuild {
    interface Build {
      /** PostGIS extension info (set by PostgisExtensionDetectionPlugin) */
      pgGISExtensionInfo?: PostgisExtensionInfo;
      /** Map of codec name -> gisTypeKey -> GraphQL type name (for resolveType) */
      pgGISGraphQLTypesByCodecAndSubtype?: Record<string, Record<string | number, string>>;
      /** Gets a registered PostGIS GraphQL type by geometry type, subtype, and dimension */
      getPostgisTypeByGeometryType?(
        gisCodecName: string,
        subtype: GisSubtype,
        hasZ?: boolean,
        hasM?: boolean,
        srid?: number
      ): GraphQLObjectType | GraphQLInterfaceType | undefined;
      /** Wraps a geometry/geography SQL expression in json_build_object() with metadata */
      pgGISWrapExpression?(fragment: SQL): SQL;
      /** Creates an SQL fragment to convert GeoJSON input to a geometry value */
      pgGISFromGeoJSON?(value: Record<string, unknown>, codecName: string): SQL;
    }

    interface Inflection {
      /** Generate GraphQL type name for a PostGIS concrete type */
      gisType(
        typeName: string,
        subtype: GisSubtype,
        hasZ: boolean,
        hasM: boolean,
        srid?: number
      ): string;
      /** Generate interface name for a PostGIS base type (e.g. GeometryInterface) */
      gisInterfaceName(typeName: string): string;
      /** Generate dimension interface name (e.g. GeometryGeometryZ) */
      gisDimensionInterfaceName(typeName: string, hasZ: boolean, hasM: boolean): string;
      /** Generate GeoJSON field name */
      geojsonFieldName(): string;
      /** Generate X coordinate field name */
      gisXFieldName(typeName: string): string;
      /** Generate Y coordinate field name */
      gisYFieldName(typeName: string): string;
      /** Generate Z coordinate field name */
      gisZFieldName(typeName: string): string;
    }

    interface ScopeObject {
      /** Whether this is a PostGIS concrete type */
      isPgGISType?: boolean;
      /** The codec name (geometry/geography) this type belongs to */
      pgGISCodecName?: string;
      /** The type details (subtype, hasZ, hasM, srid) */
      pgGISTypeDetails?: GisTypeDetails;
    }

    interface ScopeInterface {
      /** Whether this is a PostGIS base interface */
      isPgGISInterface?: boolean;
      /** Whether this is a PostGIS dimension interface */
      isPgGISDimensionInterface?: boolean;
      /** The codec name (geometry/geography) this interface belongs to */
      pgGISCodecName?: string;
      /** The ZM flag (-1 for base, 0-3 for dimension) */
      pgGISZMFlag?: number;
    }
  }
}
