import 'graphile-build';
import 'graphile-build-pg';
import 'graphile-connection-filter';

import type { PgCodec } from '@dataplan/pg';
import type {
  ConnectionFilterOperatorFactory,
  ConnectionFilterOperatorRegistration,
  ConnectionFilterOperatorSpec,
} from 'graphile-connection-filter';
import type { SQL } from 'pg-sql2';
import sql from 'pg-sql2';

import { CONCRETE_SUBTYPES } from '../constants';
import type { PostgisExtensionInfo } from './detect-extension';

/**
 * Builds an infix operator SQL fragment from a validated operator string.
 * Uses explicit template literals for each operator to avoid sql.raw.
 */
function buildOperatorExpr(schemaName: string, op: string, i: SQL, v: SQL): SQL {
  const schema = sql.identifier(schemaName);
  switch (op) {
  case '=':   return sql.fragment`${i} OPERATOR(${schema}.=) ${v}`;
  case '&&':  return sql.fragment`${i} OPERATOR(${schema}.&&) ${v}`;
  case '&&&': return sql.fragment`${i} OPERATOR(${schema}.&&&) ${v}`;
  case '&<':  return sql.fragment`${i} OPERATOR(${schema}.&<) ${v}`;
  case '&<|': return sql.fragment`${i} OPERATOR(${schema}.&<|) ${v}`;
  case '&>':  return sql.fragment`${i} OPERATOR(${schema}.&>) ${v}`;
  case '|&>': return sql.fragment`${i} OPERATOR(${schema}.|&>) ${v}`;
  case '<<':  return sql.fragment`${i} OPERATOR(${schema}.<<) ${v}`;
  case '<<|': return sql.fragment`${i} OPERATOR(${schema}.<<|) ${v}`;
  case '>>':  return sql.fragment`${i} OPERATOR(${schema}.>>) ${v}`;
  case '|>>': return sql.fragment`${i} OPERATOR(${schema}.|>>) ${v}`;
  case '~':   return sql.fragment`${i} OPERATOR(${schema}.~) ${v}`;
  case '~=':  return sql.fragment`${i} OPERATOR(${schema}.~=) ${v}`;
  default:
    throw new Error(`Unexpected PostGIS SQL operator: ${op}`);
  }
}

// PostGIS function-based operators
const FUNCTION_SPECS: [string, string[], string, string][] = [
  [
    'ST_3DIntersects',
    ['geometry'],
    'intersects3D',
    'They share any portion of space in 3D.'
  ],
  [
    'ST_Contains',
    ['geometry'],
    'contains',
    'No points of the specified geometry lie in the exterior, and at least one point of the interior of the specified geometry lies in the interior.'
  ],
  [
    'ST_ContainsProperly',
    ['geometry'],
    'containsProperly',
    'The specified geometry intersects the interior but not the boundary (or exterior).'
  ],
  [
    'ST_CoveredBy',
    ['geometry', 'geography'],
    'coveredBy',
    'No point is outside the specified geometry.'
  ],
  [
    'ST_Covers',
    ['geometry', 'geography'],
    'covers',
    'No point in the specified geometry is outside.'
  ],
  [
    'ST_Crosses',
    ['geometry'],
    'crosses',
    'They have some, but not all, interior points in common.'
  ],
  [
    'ST_Disjoint',
    ['geometry'],
    'disjoint',
    'They do not share any space together.'
  ],
  [
    'ST_Equals',
    ['geometry'],
    'equals',
    'They represent the same geometry. Directionality is ignored.'
  ],
  [
    'ST_Intersects',
    ['geometry', 'geography'],
    'intersects',
    'They share any portion of space in 2D.'
  ],
  [
    'ST_OrderingEquals',
    ['geometry'],
    'orderingEquals',
    'They represent the same geometry and points are in the same directional order.'
  ],
  [
    'ST_Overlaps',
    ['geometry'],
    'overlaps',
    'They share space, are of the same dimension, but are not completely contained by each other.'
  ],
  [
    'ST_Touches',
    ['geometry'],
    'touches',
    'They have at least one point in common, but their interiors do not intersect.'
  ],
  [
    'ST_Within',
    ['geometry'],
    'within',
    'Completely inside the specified geometry.'
  ]
];

// SQL operator-based operators
const OPERATOR_SPECS: [string, string[], string, string][] = [
  [
    '=',
    ['geometry', 'geography'],
    'exactlyEquals',
    'Coordinates and coordinate order are the same as specified geometry.'
  ],
  [
    '&&',
    ['geometry', 'geography'],
    'bboxIntersects2D',
    "2D bounding box intersects the specified geometry's 2D bounding box."
  ],
  [
    '&&&',
    ['geometry'],
    'bboxIntersectsND',
    "n-D bounding box intersects the specified geometry's n-D bounding box."
  ],
  [
    '&<',
    ['geometry'],
    'bboxOverlapsOrLeftOf',
    "Bounding box overlaps or is to the left of the specified geometry's bounding box."
  ],
  [
    '&<|',
    ['geometry'],
    'bboxOverlapsOrBelow',
    "Bounding box overlaps or is below the specified geometry's bounding box."
  ],
  [
    '&>',
    ['geometry'],
    'bboxOverlapsOrRightOf',
    "Bounding box overlaps or is to the right of the specified geometry's bounding box."
  ],
  [
    '|&>',
    ['geometry'],
    'bboxOverlapsOrAbove',
    "Bounding box overlaps or is above the specified geometry's bounding box."
  ],
  [
    '<<',
    ['geometry'],
    'bboxLeftOf',
    "Bounding box is strictly to the left of the specified geometry's bounding box."
  ],
  [
    '<<|',
    ['geometry'],
    'bboxBelow',
    "Bounding box is strictly below the specified geometry's bounding box."
  ],
  [
    '>>',
    ['geometry'],
    'bboxRightOf',
    "Bounding box is strictly to the right of the specified geometry's bounding box."
  ],
  [
    '|>>',
    ['geometry'],
    'bboxAbove',
    "Bounding box is strictly above the specified geometry's bounding box."
  ],
  [
    '~',
    ['geometry'],
    'bboxContains',
    "Bounding box contains the specified geometry's bounding box."
  ],
  [
    '~=',
    ['geometry'],
    'bboxEquals',
    "Bounding box is the same as the specified geometry's bounding box."
  ]
];

/**
 * Creates the PostGIS spatial filter operator factory.
 *
 * This factory dynamically generates operator registrations based on the
 * PostGIS extension info discovered during the build phase. It discovers
 * all geometry/geography GQL type names and creates ST_ function-based
 * and SQL operator-based filter operators for each.
 *
 * Registered via the declarative `connectionFilterOperatorFactories` API
 * in the GraphilePostgisPreset.
 */
export function createPostgisOperatorFactory(): ConnectionFilterOperatorFactory {
  return (build) => {
    const postgisInfo: PostgisExtensionInfo | undefined = (build as any).pgGISExtensionInfo;
    if (!postgisInfo) {
      return [];
    }

    const { inflection } = build;
    const { schemaName, geometryCodec, geographyCodec } = postgisInfo;

    const sqlGeomFromGeoJSON = sql.identifier(schemaName, 'st_geomfromgeojson');
    const sqlGeographyType = sql.identifier(schemaName, 'geography');

    // Collect all GQL type names for geometry and geography
    const gqlTypeNamesByBase: Record<string, string[]> = {
      geometry: [],
      geography: []
    };

    const codecPairs: [string, PgCodec][] = [];
    if (geometryCodec) {
      codecPairs.push(['geometry', geometryCodec]);
    }
    if (geographyCodec) {
      codecPairs.push(['geography', geographyCodec]);
    }
    for (const [baseKey, codec] of codecPairs) {
      const typeName: string = codec.name;
      gqlTypeNamesByBase[baseKey].push((inflection as any).gisInterfaceName(typeName));

      for (const subtype of CONCRETE_SUBTYPES) {
        for (const hasZ of [false, true]) {
          for (const hasM of [false, true]) {
            gqlTypeNamesByBase[baseKey].push(
              (inflection as any).gisType(typeName, subtype, hasZ, hasM, 0)
            );
          }
        }
      }
    }

    // Collect all resolved specs
    interface InternalSpec {
      typeNames: string[];
      operatorName: string;
      description: string;
      baseType: 'geometry' | 'geography';
      resolve: (i: SQL, v: SQL) => SQL;
    }
    const allSpecs: InternalSpec[] = [];

    // Process function-based operators
    for (const [fn, baseTypes, operatorName, description] of FUNCTION_SPECS) {
      for (const baseType of baseTypes) {
        const sqlGisFunction = sql.identifier(schemaName, fn.toLowerCase());

        allSpecs.push({
          typeNames: gqlTypeNamesByBase[baseType],
          operatorName,
          description,
          baseType: baseType as 'geometry' | 'geography',
          resolve: (i: SQL, v: SQL) => sql.fragment`${sqlGisFunction}(${i}, ${v})`
        });
      }
    }

    // Process SQL operator-based operators
    for (const [op, baseTypes, operatorName, description] of OPERATOR_SPECS) {
      for (const baseType of baseTypes) {
        // Capture op for closure
        const capturedOp = op;
        allSpecs.push({
          typeNames: gqlTypeNamesByBase[baseType],
          operatorName,
          description,
          baseType: baseType as 'geometry' | 'geography',
          resolve: (i: SQL, v: SQL) =>
            buildOperatorExpr(schemaName, capturedOp, i, v)
        });
      }
    }

    // Sort by operator name for deterministic schema output
    allSpecs.sort((a, b) => a.operatorName.localeCompare(b.operatorName));

    // Convert to ConnectionFilterOperatorRegistration format.
    // Each InternalSpec may target multiple type names; we expand each
    // into individual registrations keyed by typeName.
    //
    // The default operatorApply pipeline binds the filter value as a raw
    // text parameter cast to the column codec's sqlType (geometry /
    // geography). PostgreSQL's geometry_in / geography_in parsers reject
    // GeoJSON text, so we must wrap the input with ST_GeomFromGeoJSON
    // ourselves — see within-distance-operator.ts for the pattern.
    //
    // We disable the default bind via `resolveSqlValue: () => sql.null`
    // and construct the geometry value from `input` inside resolve(),
    // mirroring the ST_DWithin implementation.
    const registrations: ConnectionFilterOperatorRegistration[] = [];
    for (const spec of allSpecs) {
      const geographyCast = spec.baseType === 'geography'
        ? sql.fragment`::${sqlGeographyType}`
        : sql.fragment``;

      for (const typeName of spec.typeNames) {
        registrations.push({
          typeNames: typeName,
          operatorName: spec.operatorName,
          spec: {
            description: spec.description,
            resolveType: (fieldType) => fieldType,
            resolveSqlValue: () => sql.null,
            resolve(
              sqlIdentifier: SQL,
              _sqlValue: SQL,
              input: unknown,
              _$where: any,
              _details: { fieldName: string | null; operatorName: string }
            ) {
              const geoJsonStr = sql.value(JSON.stringify(input));
              const geomSql = sql.fragment`${sqlGeomFromGeoJSON}(${geoJsonStr}::text)${geographyCast}`;
              return spec.resolve(sqlIdentifier, geomSql);
            }
          } satisfies ConnectionFilterOperatorSpec,
        });
      }
    }

    return registrations;
  };
}
