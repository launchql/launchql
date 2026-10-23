import { buildScalarEncoding } from './encoding-meta-builders';
import type {
  EnumMeta,
  FieldMeta,
  GqlTypeResolverBuild,
  PgAttribute,
  PgCodec,
} from './types';

const PG_TO_GQL_TYPE: Readonly<Record<string, string>> = {
  text: 'String',
  varchar: 'String',
  char: 'String',
  name: 'String',
  bpchar: 'String',
  uuid: 'UUID',
  int2: 'Int',
  int4: 'Int',
  integer: 'Int',
  int8: 'BigInt',
  bigint: 'BigInt',
  float4: 'Float',
  float8: 'Float',
  numeric: 'BigFloat',
  bool: 'Boolean',
  boolean: 'Boolean',
  timestamptz: 'Datetime',
  timestamp: 'Datetime',
  date: 'Date',
  time: 'Time',
  timetz: 'Time',
  json: 'JSON',
  jsonb: 'JSON',
  interval: 'Interval',
  point: 'Point',
  geometry: 'GeoJSON',
  geography: 'GeoJSON',
  inet: 'InternetAddress',
  cidr: 'InternetAddress',
  xml: 'String',
  bytea: 'String',
  macaddr: 'String',
};

export function pgTypeToGqlType(pgTypeName: string): string {
  return PG_TO_GQL_TYPE[pgTypeName] || pgTypeName;
}

function getGeometrySubtype(
  attr: PgAttribute | null | undefined,
): string | null {
  const subtype = attr?.extensions?.geometrySubtype;
  return typeof subtype === 'string' ? subtype : null;
}

function resolveGqlTypeName(
  build: GqlTypeResolverBuild | undefined,
  codec: PgCodec | null | undefined,
): string {
  if (!codec) return 'unknown';

  try {
    const codecForLookup = codec.arrayOfCodec || codec;
    if (build?.hasGraphQLTypeForPgCodec?.(codecForLookup, 'output')) {
      const resolved = build.getGraphQLTypeNameByPgCodec?.(codecForLookup, 'output');
      if (resolved) return resolved;
    }
  } catch {
    // Fall through to static fallback mapping.
  }

  const pgTypeName = codec.name || 'unknown';
  const mapped = pgTypeToGqlType(pgTypeName);
  if (mapped !== pgTypeName) return mapped;

  const nestedTypeName = codec.arrayOfCodec?.name;
  return nestedTypeName ? pgTypeToGqlType(nestedTypeName) : pgTypeName;
}

function extractEnumMeta(
  codec: PgCodec | null | undefined,
): EnumMeta | null {
  if (!codec) return null;

  // Check the codec itself, or unwrap domain/array wrappers
  const inner = (codec as any).domainOfCodec ?? (codec as any).arrayOfCodec ?? codec;
  const values = (inner as any).values;
  if (!Array.isArray(values) || values.length === 0) return null;

  return {
    name: inner.name || codec.name || 'unknown',
    values: values.map((v: any) => (typeof v === 'string' ? v : v.value)),
  };
}

/** The allowed values the gather phase recorded on a column, if any. */
export function readAllowedValues(attr: PgAttribute | null | undefined): string[] | null {
  const values = attr?.extensions?.allowedValues;
  return Array.isArray(values) && values.every((v) => typeof v === 'string') ? values : null;
}

export interface BuildFieldMetaOptions {
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export function buildFieldMeta(
  name: string,
  columnName: string,
  attr: PgAttribute | null | undefined,
  build?: GqlTypeResolverBuild,
  options?: BuildFieldMetaOptions,
): FieldMeta {
  const pgType = attr?.codec?.name || 'unknown';
  const isNotNull = attr?.notNull || false;
  const hasDefault = attr?.hasDefault || false;
  const subtype = getGeometrySubtype(attr);

  return {
    name,
    columnName,
    type: {
      pgType,
      gqlType: build ? resolveGqlTypeName(build, attr?.codec) : pgTypeToGqlType(pgType),
      isArray: !!attr?.codec?.arrayOfCodec,
      isNotNull,
      hasDefault,
      subtype,
      encoding: buildScalarEncoding(attr),
    },
    isNotNull,
    hasDefault,
    isPrimaryKey: options?.isPrimaryKey ?? false,
    isForeignKey: options?.isForeignKey ?? false,
    description: attr?.description ?? null,
    enumValues: extractEnumMeta(attr?.codec),
    // Set by the table builder for exposed fields only.
    allowedValues: null,
    isRequiredOnCreate: null,
    isWritableOnCreate: null,
    isWritableOnUpdate: null,
  };
}
