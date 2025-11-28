import type { Build, Inflection } from 'graphile-build';
import type { PgExtension, PgIntrospectionResultsByKind, PgType } from 'graphile-build-pg';
import type { SQL } from 'graphile-build-pg/node8plus/QueryBuilder';
import type {
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLType
} from 'graphql';
import type { Geometry } from 'geojson';

import type { GisSubtype } from './constants';

export interface GisTypeDetails {
  subtype: GisSubtype;
  hasZ: boolean;
  hasM: boolean;
  srid: number;
}

export type GisGraphQLType = GraphQLInterfaceType | GraphQLObjectType;

export interface GisFieldValue {
  __gisType: string;
  __srid: number;
  __geojson: Geometry;
}

export interface PostgisInflection extends Inflection {
  gisType(
    type: PgType,
    subtype: GisSubtype,
    hasZ: boolean,
    hasM: boolean,
    srid?: number
  ): string;
  gisInterfaceName(type: PgType): string;
  gisDimensionInterfaceName(type: PgType, hasZ: boolean, hasM: boolean): string;
  geojsonFieldName(): string;
  gisXFieldName(type: PgType): string;
  gisYFieldName(type: PgType): string;
  gisZFieldName(type: PgType): string;
}

export type PgTweaksByTypeIdAndModifier = Record<
  string | number,
  Record<string | number, (fragment: SQL, resolveData: unknown) => SQL>
>;

export interface PgMapper {
  map: (value: unknown) => unknown;
  unmap: (value: unknown) => SQL;
}

export interface PostgisBuild extends Build {
  extend<TBase extends object, TExtension extends object>(base: TBase, extension: TExtension): TBase & TExtension;
  newWithHooks: <TType extends GraphQLOutputType, TConfig extends object>(
    constructor: new (config: TConfig) => TType,
    spec: TConfig,
    scope?: Record<string, unknown>
  ) => TType;
  getTypeByName: (name: string) => GraphQLType | undefined;
  pgIntrospectionResultsByKind: PgIntrospectionResultsByKind;
  pgRegisterGqlTypeByTypeId: (
    typeId: string | number,
    generator: (set: Record<string, unknown>, typeModifier: number | null) => GraphQLOutputType
  ) => void;
  pgRegisterGqlInputTypeByTypeId: (typeId: string | number, generator: () => GraphQLInputType) => void;
  pgGetGqlTypeByTypeIdAndModifier: (
    typeId: string | number,
    typeModifier: number | null
  ) => GraphQLOutputType | GraphQLInterfaceType | null | undefined;
  pgTweaksByTypeIdAndModifer: PgTweaksByTypeIdAndModifier;
  pgSql: typeof import('graphile-build-pg/node8plus/QueryBuilder').sql;
  pg2gql: (value: unknown, type: PgType) => unknown;
  pg2GqlMapper: Record<string | number, PgMapper>;
  pgGISGraphQLTypesByTypeAndSubtype: Record<string | number, Record<string | number, GisGraphQLType>>;
  pgGISGraphQLInterfaceTypesByType: Record<string | number, Record<number, GraphQLInterfaceType>>;
  pgGISGeometryType?: PgType;
  pgGISGeographyType?: PgType;
  pgGISExtension?: PgExtension;
  pgGISIncludedTypes: GisGraphQLType[];
  pgGISIncludeType: (type: GisGraphQLType) => void;
  getPostgisTypeByGeometryType: (
    pgGISType: PgType,
    subtype: GisSubtype,
    hasZ?: boolean,
    hasM?: boolean,
    srid?: number
  ) => GraphQLOutputType | GraphQLInterfaceType | null | undefined;
  inflection: PostgisInflection;
}

export interface GisScope {
  isPgGISType?: boolean;
  pgGISType?: PgType;
  pgGISTypeDetails?: GisTypeDetails;
}
