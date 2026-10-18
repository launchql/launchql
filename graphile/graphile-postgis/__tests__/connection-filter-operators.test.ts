import sql from 'pg-sql2';

import { CONCRETE_SUBTYPES } from '../src/constants';
import { createPostgisOperatorFactory } from '../src/plugins/connection-filter-operators';
import { GraphilePostgisPreset } from '../src/preset';

// Build a mock inflection that matches what graphile-postgis produces
function createMockInflection() {
  return {
    upperCamelCase(str: string) {
      return str
        .split('-')
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
    },
    gisInterfaceName(typeName: string) {
      return this.upperCamelCase(`${typeName}-interface`);
    },
    gisType(
      typeName: string,
      subtype: number,
      hasZ: boolean,
      hasM: boolean,
      _srid?: number
    ) {
      const subtypeNames: Record<number, string> = {
        0: 'geometry',
        1: 'point',
        2: 'line-string',
        3: 'polygon',
        4: 'multi-point',
        5: 'multi-line-string',
        6: 'multi-polygon',
        7: 'geometry-collection'
      };
      const parts = [
        typeName,
        subtypeNames[subtype],
        hasZ ? 'z' : null,
        hasM ? 'm' : null
      ].filter(Boolean);
      return this.upperCamelCase(parts.join('-'));
    }
  };
}

// Run the factory and capture all registered operators
function runFactory(options: {
  schemaName?: string;
  hasPostgis?: boolean;
} = {}) {
  const {
    schemaName = 'public',
    hasPostgis = true
  } = options;

  const inflection = createMockInflection();

  const postgisInfo = hasPostgis
    ? {
      schemaName,
      geometryCodec: { name: 'geometry' },
      geographyCodec: { name: 'geography' }
    }
    : undefined;

  const build = {
    inflection,
    pgGISExtensionInfo: postgisInfo
  };

  const factory = createPostgisOperatorFactory();
  const registrations = factory(build as any);

  // Flatten registrations into a simpler structure for test assertions
  const registered = registrations.map(r => ({
    typeName: r.typeNames as string,
    operatorName: r.operatorName,
    description: r.spec.description,
    resolveType: r.spec.resolveType,
    resolve: r.spec.resolve
  }));

  return { registered, registrations };
}

describe('PostGIS operator factory (createPostgisOperatorFactory)', () => {
  describe('preset', () => {
    it('declares the factory in connectionFilterOperatorFactories', () => {
      const schema = GraphilePostgisPreset.schema as Record<string, unknown> | undefined;
      const factories = schema?.connectionFilterOperatorFactories as unknown[] | undefined;
      expect(factories).toBeDefined();
      expect(factories).toHaveLength(2);
      expect(typeof factories![0]).toBe('function');
      expect(typeof factories![1]).toBe('function');
    });
  });

  describe('graceful degradation', () => {
    it('returns empty array when PostGIS is not available', () => {
      const { registered } = runFactory({ hasPostgis: false });
      expect(registered).toHaveLength(0);
    });
  });

  describe('operator registration', () => {
    const FUNCTION_OPERATORS = [
      { name: 'intersects3D', fn: 'st_3dintersects', baseTypes: ['geometry'] },
      { name: 'contains', fn: 'st_contains', baseTypes: ['geometry'] },
      { name: 'containsProperly', fn: 'st_containsproperly', baseTypes: ['geometry'] },
      { name: 'coveredBy', fn: 'st_coveredby', baseTypes: ['geometry', 'geography'] },
      { name: 'covers', fn: 'st_covers', baseTypes: ['geometry', 'geography'] },
      { name: 'crosses', fn: 'st_crosses', baseTypes: ['geometry'] },
      { name: 'disjoint', fn: 'st_disjoint', baseTypes: ['geometry'] },
      { name: 'equals', fn: 'st_equals', baseTypes: ['geometry'] },
      { name: 'intersects', fn: 'st_intersects', baseTypes: ['geometry', 'geography'] },
      { name: 'orderingEquals', fn: 'st_orderingequals', baseTypes: ['geometry'] },
      { name: 'overlaps', fn: 'st_overlaps', baseTypes: ['geometry'] },
      { name: 'touches', fn: 'st_touches', baseTypes: ['geometry'] },
      { name: 'within', fn: 'st_within', baseTypes: ['geometry'] }
    ];

    const SQL_OPERATORS = [
      { name: 'exactlyEquals', op: '=', baseTypes: ['geometry', 'geography'] },
      { name: 'bboxIntersects2D', op: '&&', baseTypes: ['geometry', 'geography'] },
      { name: 'bboxIntersectsND', op: '&&&', baseTypes: ['geometry'] },
      { name: 'bboxOverlapsOrLeftOf', op: '&<', baseTypes: ['geometry'] },
      { name: 'bboxOverlapsOrBelow', op: '&<|', baseTypes: ['geometry'] },
      { name: 'bboxOverlapsOrRightOf', op: '&>', baseTypes: ['geometry'] },
      { name: 'bboxOverlapsOrAbove', op: '|&>', baseTypes: ['geometry'] },
      { name: 'bboxLeftOf', op: '<<', baseTypes: ['geometry'] },
      { name: 'bboxBelow', op: '<<|', baseTypes: ['geometry'] },
      { name: 'bboxRightOf', op: '>>', baseTypes: ['geometry'] },
      { name: 'bboxAbove', op: '|>>', baseTypes: ['geometry'] },
      { name: 'bboxContains', op: '~', baseTypes: ['geometry'] },
      { name: 'bboxEquals', op: '~=', baseTypes: ['geometry'] }
    ];

    it('registers exactly 13 function-based operators', () => {
      expect(FUNCTION_OPERATORS).toHaveLength(13);
    });

    it('registers exactly 13 SQL operator-based operators', () => {
      expect(SQL_OPERATORS).toHaveLength(13);
    });

    it('registers all 26 unique operator names', () => {
      const { registered } = runFactory();
      const uniqueOperatorNames = [...new Set(registered.map(r => r.operatorName))];
      const allExpected = [
        ...FUNCTION_OPERATORS.map(o => o.name),
        ...SQL_OPERATORS.map(o => o.name)
      ];
      expect(uniqueOperatorNames.sort()).toEqual(allExpected.sort());
    });

    it('registers operators sorted by name', () => {
      const { registered } = runFactory();
      const operatorNames = registered.map(r => r.operatorName);
      // Within each consecutive group of the same operator, order should be consistent
      // Globally, operators should be sorted alphabetically
      const seen: string[] = [];
      for (const name of operatorNames) {
        if (seen.length === 0 || seen[seen.length - 1] !== name) {
          if (seen.length > 0) {
            // Each new operator name should be >= the last distinct name
            expect(name >= seen[seen.length - 1]).toBe(true);
          }
          seen.push(name);
        }
      }
    });
  });

  describe('type name coverage', () => {
    // Per base type: 1 interface + 7 subtypes * 4 dimension combos = 29 type names
    const TYPES_PER_BASE = 1 + CONCRETE_SUBTYPES.length * 4; // 29

    it('generates correct number of type names per base type', () => {
      const { registered } = runFactory();
      // Pick a geometry-only operator (e.g., 'contains')
      const containsOps = registered.filter(r => r.operatorName === 'contains');
      expect(containsOps).toHaveLength(TYPES_PER_BASE);
    });

    it('doubles registrations for geometry+geography operators', () => {
      const { registered } = runFactory();
      // 'intersects' applies to both geometry and geography
      const intersectsOps = registered.filter(r => r.operatorName === 'intersects');
      expect(intersectsOps).toHaveLength(TYPES_PER_BASE * 2);
    });

    it('includes interface names in type names', () => {
      const { registered } = runFactory();
      const containsTypeNames = registered
        .filter(r => r.operatorName === 'contains')
        .map(r => r.typeName);
      expect(containsTypeNames).toContain('GeometryInterface');
    });

    it('includes concrete subtype names', () => {
      const { registered } = runFactory();
      const containsTypeNames = registered
        .filter(r => r.operatorName === 'contains')
        .map(r => r.typeName);
      // Should include GeometryPoint, GeometryPolygon, etc.
      expect(containsTypeNames).toContain('GeometryPoint');
      expect(containsTypeNames).toContain('GeometryPolygon');
      expect(containsTypeNames).toContain('GeometryLineString');
      expect(containsTypeNames).toContain('GeometryMultiPoint');
      expect(containsTypeNames).toContain('GeometryMultiLineString');
      expect(containsTypeNames).toContain('GeometryMultiPolygon');
      expect(containsTypeNames).toContain('GeometryGeometryCollection');
    });

    it('includes Z/M dimension variants', () => {
      const { registered } = runFactory();
      const containsTypeNames = registered
        .filter(r => r.operatorName === 'contains')
        .map(r => r.typeName);
      expect(containsTypeNames).toContain('GeometryPointZ');
      expect(containsTypeNames).toContain('GeometryPointM');
      expect(containsTypeNames).toContain('GeometryPointZM');
    });

    it('includes geography types for dual-base operators', () => {
      const { registered } = runFactory();
      const intersectsTypeNames = registered
        .filter(r => r.operatorName === 'intersects')
        .map(r => r.typeName);
      expect(intersectsTypeNames).toContain('GeographyInterface');
      expect(intersectsTypeNames).toContain('GeographyPoint');
      expect(intersectsTypeNames).toContain('GeometryInterface');
      expect(intersectsTypeNames).toContain('GeometryPoint');
    });
  });

  describe('SQL generation', () => {
    describe('function-based operators', () => {
      // The input-binding contract (regression guard for #724): every
      // operator must wrap the GeoJSON input with ST_GeomFromGeoJSON(...)
      // — PostgreSQL's geometry_in / geography_in parsers reject raw
      // GeoJSON text. The compiled SQL must therefore always contain the
      // schema-qualified function call binding the JSON-encoded input as
      // `::text` before any further casting.

      it('wraps input with ST_GeomFromGeoJSON (public schema)', () => {
        const { registered } = runFactory({ schemaName: 'public' });
        const containsOp = registered.find(r => r.operatorName === 'contains');
        expect(containsOp).toBeDefined();

        const i = sql.identifier('col');
        const v = sql.identifier('val');
        const input = { type: 'Point', coordinates: [-122.4194, 37.7749] };
        const result = containsOp!.resolve(i, v, input, null, {
          fieldName: null,
          operatorName: 'contains'
        });
        const compiled = sql.compile(result);
        expect(compiled.text).toBe(
          '"public"."st_contains"("col", "public"."st_geomfromgeojson"($1::text))'
        );
        expect(compiled.values).toEqual([JSON.stringify(input)]);
      });

      it('wraps input with ST_GeomFromGeoJSON (non-public schema)', () => {
        const { registered } = runFactory({ schemaName: 'postgis' });
        const containsOp = registered.find(r => r.operatorName === 'contains');
        expect(containsOp).toBeDefined();

        const i = sql.identifier('col');
        const v = sql.identifier('val');
        const input = { type: 'Point', coordinates: [-122.4194, 37.7749] };
        const result = containsOp!.resolve(i, v, input, null, {
          fieldName: null,
          operatorName: 'contains'
        });
        const compiled = sql.compile(result);
        expect(compiled.text).toBe(
          '"postgis"."st_contains"("col", "postgis"."st_geomfromgeojson"($1::text))'
        );
        expect(compiled.values).toEqual([JSON.stringify(input)]);
      });

      it('lowercases function names in SQL', () => {
        const { registered } = runFactory();
        const op3d = registered.find(r => r.operatorName === 'intersects3D');
        expect(op3d).toBeDefined();

        const i = sql.identifier('a');
        const v = sql.identifier('b');
        const input = { type: 'Point', coordinates: [-122.4194, 37.7749, 254] };
        const result = op3d!.resolve(i, v, input, null, {
          fieldName: null,
          operatorName: 'intersects3D'
        });
        const compiled = sql.compile(result);
        expect(compiled.text).toBe(
          '"public"."st_3dintersects"("a", "public"."st_geomfromgeojson"($1::text))'
        );
      });

      it('casts to geography when the operator is registered on a geography type', () => {
        const { registered } = runFactory();
        // `intersects` is registered for both geometry and geography. We
        // want the geography variant to append `::geography` after the
        // ST_GeomFromGeoJSON wrap so PostGIS picks the geography overload.
        const geogIntersects = registered.find(
          r => r.operatorName === 'intersects' && r.typeName === 'GeographyPoint'
        );
        expect(geogIntersects).toBeDefined();

        const i = sql.identifier('col');
        const v = sql.identifier('val');
        const input = { type: 'Point', coordinates: [-122.4194, 37.7749] };
        const result = geogIntersects!.resolve(i, v, input, null, {
          fieldName: null,
          operatorName: 'intersects'
        });
        const compiled = sql.compile(result);
        expect(compiled.text).toBe(
          '"public"."st_intersects"("col", "public"."st_geomfromgeojson"($1::text)::"public"."geography")'
        );
      });
    });

    describe('SQL operator-based operators', () => {
      const runOp = (operatorName: string) => {
        const { registered } = runFactory();
        const op = registered.find(r => r.operatorName === operatorName);
        expect(op).toBeDefined();

        const input = { type: 'Point', coordinates: [-122.4194, 37.7749] };
        const result = op!.resolve(
          sql.identifier('col'),
          sql.identifier('val'),
          input,
          null,
          { fieldName: null, operatorName }
        );
        return sql.compile(result);
      };

      it('generates correct SQL for = operator', () => {
        expect(runOp('exactlyEquals').text).toBe(
          '"col" OPERATOR("public".=) "public"."st_geomfromgeojson"($1::text)'
        );
      });

      it('generates correct SQL for && operator', () => {
        expect(runOp('bboxIntersects2D').text).toBe(
          '"col" OPERATOR("public".&&) "public"."st_geomfromgeojson"($1::text)'
        );
      });

      it('generates correct SQL for ~ operator', () => {
        expect(runOp('bboxContains').text).toBe(
          '"col" OPERATOR("public".~) "public"."st_geomfromgeojson"($1::text)'
        );
      });

      it('generates correct SQL for ~= operator', () => {
        expect(runOp('bboxEquals').text).toBe(
          '"col" OPERATOR("public".~=) "public"."st_geomfromgeojson"($1::text)'
        );
      });

      it('generates correct SQL for &&& operator', () => {
        expect(runOp('bboxIntersectsND').text).toBe(
          '"col" OPERATOR("public".&&&) "public"."st_geomfromgeojson"($1::text)'
        );
      });
    });
  });

  describe('resolveType', () => {
    it('returns fieldType unchanged (identity)', () => {
      const { registered } = runFactory();
      const op = registered[0];
      const mockType = { name: 'GeometryInterface' } as any;
      expect(op.resolveType(mockType)).toBe(mockType);
    });
  });

  describe('operator descriptions', () => {
    const expectedDescriptions: Record<string, string> = {
      intersects3D: 'They share any portion of space in 3D.',
      contains:
        'No points of the specified geometry lie in the exterior, and at least one point of the interior of the specified geometry lies in the interior.',
      containsProperly:
        'The specified geometry intersects the interior but not the boundary (or exterior).',
      coveredBy: 'No point is outside the specified geometry.',
      covers: 'No point in the specified geometry is outside.',
      crosses: 'They have some, but not all, interior points in common.',
      disjoint: 'They do not share any space together.',
      equals: 'They represent the same geometry. Directionality is ignored.',
      intersects: 'They share any portion of space in 2D.',
      orderingEquals:
        'They represent the same geometry and points are in the same directional order.',
      overlaps:
        'They share space, are of the same dimension, but are not completely contained by each other.',
      touches:
        'They have at least one point in common, but their interiors do not intersect.',
      within: 'Completely inside the specified geometry.',
      exactlyEquals:
        'Coordinates and coordinate order are the same as specified geometry.',
      bboxIntersects2D:
        "2D bounding box intersects the specified geometry's 2D bounding box.",
      bboxIntersectsND:
        "n-D bounding box intersects the specified geometry's n-D bounding box.",
      bboxOverlapsOrLeftOf:
        "Bounding box overlaps or is to the left of the specified geometry's bounding box.",
      bboxOverlapsOrBelow:
        "Bounding box overlaps or is below the specified geometry's bounding box.",
      bboxOverlapsOrRightOf:
        "Bounding box overlaps or is to the right of the specified geometry's bounding box.",
      bboxOverlapsOrAbove:
        "Bounding box overlaps or is above the specified geometry's bounding box.",
      bboxLeftOf:
        "Bounding box is strictly to the left of the specified geometry's bounding box.",
      bboxBelow:
        "Bounding box is strictly below the specified geometry's bounding box.",
      bboxRightOf:
        "Bounding box is strictly to the right of the specified geometry's bounding box.",
      bboxAbove:
        "Bounding box is strictly above the specified geometry's bounding box.",
      bboxContains:
        "Bounding box contains the specified geometry's bounding box.",
      bboxEquals:
        "Bounding box is the same as the specified geometry's bounding box."
    };

    it('has correct descriptions for all 26 operators', () => {
      const { registered } = runFactory();
      for (const [opName, expectedDesc] of Object.entries(expectedDescriptions)) {
        const op = registered.find(r => r.operatorName === opName);
        expect(op).toBeDefined();
        expect(op!.description).toBe(expectedDesc);
      }
    });

    it('covers all 26 expected descriptions', () => {
      expect(Object.keys(expectedDescriptions)).toHaveLength(26);
    });
  });

  describe('total registration count', () => {
    it('registers the correct total number of operator+type combinations', () => {
      const { registered } = runFactory();
      // geometry-only function ops: 10 ops * 29 types = 290
      // geometry+geography function ops: 3 ops * 29 * 2 = 174
      // geometry-only SQL ops: 11 ops * 29 types = 319
      // geometry+geography SQL ops: 2 ops * 29 * 2 = 116
      // Total: 290 + 174 + 319 + 116 = 899
      const typesPerBase = 1 + CONCRETE_SUBTYPES.length * 4; // 29

      const geoOnlyFnOps = 10;
      const dualFnOps = 3;
      const geoOnlySqlOps = 11;
      const dualSqlOps = 2;

      const expected =
        geoOnlyFnOps * typesPerBase +
        dualFnOps * typesPerBase * 2 +
        geoOnlySqlOps * typesPerBase +
        dualSqlOps * typesPerBase * 2;

      expect(registered).toHaveLength(expected);
    });
  });
});
