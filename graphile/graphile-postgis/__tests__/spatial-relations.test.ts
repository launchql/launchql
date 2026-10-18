import sql from 'pg-sql2';

import {
  buildSpatialJoinFragment,
  collectSpatialRelations,
  OPERATOR_REGISTRY,
  parseSpatialRelationTag,
  PostgisSpatialRelationsPlugin,
} from '../src/plugins/spatial-relations';
import { GraphilePostgisPreset } from '../src/preset';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

/**
 * Construct a mock pgRegistry that `collectSpatialRelations` can walk.
 *
 * `tables` is a map of table name -> attributes (with optional tags) +
 * optional PK attributes + optional schemaName (defaults to 'public').
 */
function buildMockRegistry(
  tables: Record<
    string,
    {
      schemaName?: string;
      pk?: string[];
      attributes: Record<
        string,
        {
          base: 'geometry' | 'geography' | 'int4' | 'text';
          spatialRelation?: string | string[];
        }
      >;
    }
  >
): any {
  const pgResources: Record<string, any> = {};
  for (const [tableName, spec] of Object.entries(tables)) {
    const schemaName = spec.schemaName ?? 'public';
    const attrs: Record<string, any> = {};
    for (const [attrName, attrSpec] of Object.entries(spec.attributes)) {
      const extensions: any = { pg: { name: attrSpec.base } };
      const tags: Record<string, unknown> = {};
      if (attrSpec.spatialRelation !== undefined) {
        tags.spatialRelation = attrSpec.spatialRelation;
      }
      attrs[attrName] = {
        codec: { extensions },
        extensions: { tags },
      };
    }
    const resource: any = {
      name: tableName,
      parameters: null,
      codec: {
        name: tableName,
        attributes: attrs,
        extensions: { pg: { schemaName, name: tableName } },
      },
      uniques: spec.pk ? [{ isPrimary: true, attributes: spec.pk }] : [],
      from: sql.identifier(schemaName, tableName),
      extensions: { pg: {} },
    };
    pgResources[tableName] = resource;
  }
  return { pgResources };
}

function makeBuild(registry: any): any {
  // Minimal inflection double — only `camelCase` is consulted by
  // `collectSpatialRelations` (to normalize the parametric arg name).
  const inflection = {
    camelCase(str: string): string {
      return str.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());
    },
  };
  return {
    input: { pgRegistry: registry },
    inflection,
  };
}

// ---------------------------------------------------------------------------
// OPERATOR_REGISTRY
// ---------------------------------------------------------------------------

describe('OPERATOR_REGISTRY', () => {
  it('includes all 8 v1 operators with snake_case names', () => {
    expect(Object.keys(OPERATOR_REGISTRY).sort()).toEqual(
      [
        'st_bbox_intersects',
        'st_contains',
        'st_coveredby',
        'st_covers',
        'st_dwithin',
        'st_equals',
        'st_intersects',
        'st_within',
      ].sort()
    );
  });

  it('marks st_dwithin as the only parametric op', () => {
    const parametric = Object.values(OPERATOR_REGISTRY)
      .filter((o) => o.parametric)
      .map((o) => o.name);
    expect(parametric).toEqual(['st_dwithin']);
  });

  it('marks st_bbox_intersects as the only infix op', () => {
    const infix = Object.values(OPERATOR_REGISTRY)
      .filter((o) => o.kind === 'infix')
      .map((o) => o.name);
    expect(infix).toEqual(['st_bbox_intersects']);
  });

  it('every operator has a non-empty description', () => {
    for (const op of Object.values(OPERATOR_REGISTRY)) {
      expect(typeof op.description).toBe('string');
      expect(op.description.length).toBeGreaterThan(0);
    }
  });

  it('every operator has pgToken matching its name (modulo && for bbox)', () => {
    for (const op of Object.values(OPERATOR_REGISTRY)) {
      if (op.kind === 'infix') {
        expect(op.pgToken).toBe('&&');
      } else {
        expect(op.pgToken).toBe(op.name);
      }
    }
  });

  it('schema-qualifies the PostGIS infix operator in relation SQL', () => {
    const fragment = buildSpatialJoinFragment(
      {
        ownerAttributeName: 'location',
        targetAttributeName: 'geom',
        operator: OPERATOR_REGISTRY.st_bbox_intersects,
      } as any,
      'postgis_ext',
      sql.identifier('owner'),
      sql.identifier('target'),
      null
    );
    expect(sql.compile(fragment).text).toBe(
      '"owner"."location" OPERATOR("postgis_ext".&&) "target"."geom"'
    );
  });
});

// ---------------------------------------------------------------------------
// parseSpatialRelationTag
// ---------------------------------------------------------------------------

describe('parseSpatialRelationTag', () => {
  it('parses a 3-token tag', () => {
    const r = parseSpatialRelationTag('county counties.geom st_contains');
    expect(r).toEqual({
      ok: true,
      relationName: 'county',
      targetRef: 'counties.geom',
      operator: 'st_contains',
      paramName: null,
    });
  });

  it('parses a 4-token parametric tag', () => {
    const r = parseSpatialRelationTag(
      'nearbyClinic clinics.location st_dwithin distance'
    );
    expect(r).toEqual({
      ok: true,
      relationName: 'nearbyClinic',
      targetRef: 'clinics.location',
      operator: 'st_dwithin',
      paramName: 'distance',
    });
  });

  it('accepts schema.table.col target references', () => {
    const r = parseSpatialRelationTag(
      'county geo.counties.geom st_contains'
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.targetRef).toBe('geo.counties.geom');
  });

  it('collapses repeated whitespace', () => {
    const r = parseSpatialRelationTag('  a  b.c   st_contains  ');
    expect(r.ok).toBe(true);
  });

  const errOf = (raw: string): string => {
    const r: any = parseSpatialRelationTag(raw);
    expect(r.ok).toBe(false);
    return r.error;
  };

  it('rejects too few tokens', () => {
    expect(errOf('only two')).toMatch(/tokens/);
  });

  it('rejects too many tokens', () => {
    expect(parseSpatialRelationTag('a b.c st_contains x extra').ok).toBe(
      false
    );
  });

  it('rejects an invalid relation name', () => {
    expect(errOf('1bad b.c st_contains')).toMatch(/relation name/);
  });

  it('rejects a malformed target reference', () => {
    expect(errOf('rel onepart st_contains')).toMatch(/Target must be/);
  });

  it('rejects an unknown operator', () => {
    expect(errOf('rel t.c st_not_real')).toMatch(/Unknown spatial operator/);
  });

  it('rejects st_dwithin without a parameter name', () => {
    expect(errOf('rel t.c st_dwithin')).toMatch(/requires a parameter name/);
  });

  it('rejects a 2-arg op with an extra parameter', () => {
    expect(errOf('rel t.c st_contains extra')).toMatch(
      /does not take a parameter/
    );
  });

  it('rejects an invalid parametric name', () => {
    expect(errOf('rel t.c st_dwithin 1bad')).toMatch(/param name/);
  });
});

// ---------------------------------------------------------------------------
// collectSpatialRelations — happy path + validation errors
// ---------------------------------------------------------------------------

describe('collectSpatialRelations', () => {
  it('returns [] when no tags are present', () => {
    const registry = buildMockRegistry({
      clinics: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          location: { base: 'geometry' },
        },
      },
    });
    const rels = collectSpatialRelations(makeBuild(registry));
    expect(rels).toEqual([]);
  });

  it('returns [] when no pgRegistry is present', () => {
    const rels = collectSpatialRelations({ input: {} });
    expect(rels).toEqual([]);
  });

  it('collects a single cross-table spatial relation', () => {
    const registry = buildMockRegistry({
      counties: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          geom: { base: 'geometry' },
        },
      },
      clinics: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          location: {
            base: 'geometry',
            spatialRelation: 'county counties.geom st_contains',
          },
        },
      },
    });
    const rels = collectSpatialRelations(makeBuild(registry));
    expect(rels).toHaveLength(1);
    const [rel] = rels;
    expect(rel.relationName).toBe('county');
    expect(rel.ownerCodec.name).toBe('clinics');
    expect(rel.ownerAttributeName).toBe('location');
    expect(rel.targetResource.codec.name).toBe('counties');
    expect(rel.targetAttributeName).toBe('geom');
    expect(rel.operator.name).toBe('st_contains');
    expect(rel.paramFieldName).toBeNull();
    expect(rel.isSelfRelation).toBe(false);
    expect(rel.ownerPkAttributes).toEqual(['id']);
    expect(rel.targetPkAttributes).toEqual(['id']);
  });

  it('collects a self-relation with parametric op', () => {
    const registry = buildMockRegistry({
      clinics: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          location: {
            base: 'geometry',
            spatialRelation:
              'nearbyClinic clinics.location st_dwithin distance',
          },
        },
      },
    });
    const [rel] = collectSpatialRelations(makeBuild(registry));
    expect(rel.isSelfRelation).toBe(true);
    expect(rel.operator.name).toBe('st_dwithin');
    expect(rel.operator.parametric).toBe(true);
    expect(rel.paramFieldName).toBe('distance');
  });

  it('camelCases snake_case parametric arg names', () => {
    // The @spatialRelation tag grammar accepts any [A-Za-z_][A-Za-z0-9_]*
    // identifier for the parametric arg; the GraphQL field we expose for
    // it must follow the same camelCase convention as every other field.
    const registry = buildMockRegistry({
      clinics: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          location: {
            base: 'geometry',
            spatialRelation:
              'nearbyClinic clinics.location st_dwithin travel_distance',
          },
        },
      },
    });
    const [rel] = collectSpatialRelations(makeBuild(registry));
    expect(rel.paramFieldName).toBe('travelDistance');
  });

  it('supports multiple tags on the same column (string[] form)', () => {
    const registry = buildMockRegistry({
      counties: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          geom: { base: 'geometry' },
        },
      },
      clinics: {
        pk: ['id'],
        attributes: {
          id: { base: 'int4' },
          location: {
            base: 'geometry',
            spatialRelation: [
              'county counties.geom st_contains',
              'intersectingCounty counties.geom st_intersects',
            ],
          },
        },
      },
    });
    const rels = collectSpatialRelations(makeBuild(registry));
    expect(rels.map((r) => r.relationName).sort()).toEqual(
      ['county', 'intersectingCounty'].sort()
    );
  });

  it('throws on an invalid tag string', () => {
    const registry = buildMockRegistry({
      clinics: {
        pk: ['id'],
        attributes: {
          location: {
            base: 'geometry',
            spatialRelation: 'bad tag only',
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /Invalid @spatialRelation tag/
    );
  });

  it('throws when the target table does not exist', () => {
    const registry = buildMockRegistry({
      clinics: {
        pk: ['id'],
        attributes: {
          location: {
            base: 'geometry',
            spatialRelation: 'county counties.geom st_contains',
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /does not resolve to a known column/
    );
  });

  it('throws when owner column is not geometry/geography', () => {
    const registry = buildMockRegistry({
      counties: {
        pk: ['id'],
        attributes: {
          geom: { base: 'geometry' },
        },
      },
      clinics: {
        pk: ['id'],
        attributes: {
          // A text column should not be allowed to carry a spatialRelation tag.
          location: {
            base: 'text',
            spatialRelation: 'county counties.geom st_contains',
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /requires a geometry or geography column/
    );
  });

  it('throws on codec mismatch (geometry vs geography)', () => {
    const registry = buildMockRegistry({
      regions: {
        pk: ['id'],
        attributes: {
          shape: { base: 'geography' },
        },
      },
      clinics: {
        pk: ['id'],
        attributes: {
          location: {
            base: 'geometry',
            spatialRelation: 'region regions.shape st_contains',
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /codec mismatch/
    );
  });

  it('throws on self-relation without a primary key', () => {
    const registry = buildMockRegistry({
      clinics: {
        // no pk
        attributes: {
          location: {
            base: 'geometry',
            spatialRelation:
              'nearbyClinic clinics.location st_dwithin distance',
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /has no primary key/
    );
  });

  it('throws on duplicate relation names on the same owner', () => {
    const registry = buildMockRegistry({
      counties: {
        pk: ['id'],
        attributes: { geom: { base: 'geometry' } },
      },
      regions: {
        pk: ['id'],
        attributes: { geom: { base: 'geometry' } },
      },
      clinics: {
        pk: ['id'],
        attributes: {
          location: {
            base: 'geometry',
            spatialRelation: [
              'region counties.geom st_contains',
              'region regions.geom st_intersects',
            ],
          },
        },
      },
    });
    expect(() => collectSpatialRelations(makeBuild(registry))).toThrow(
      /Duplicate @spatialRelation/
    );
  });
});

// ---------------------------------------------------------------------------
// Plugin metadata
// ---------------------------------------------------------------------------

describe('PostgisSpatialRelationsPlugin (metadata)', () => {
  it('runs after the relevant plugins', () => {
    expect(PostgisSpatialRelationsPlugin.after).toContain(
      'PostgisExtensionDetectionPlugin'
    );
    expect(PostgisSpatialRelationsPlugin.after).toContain(
      'PostgisRegisterTypesPlugin'
    );
    expect(PostgisSpatialRelationsPlugin.after).toContain(
      'ConnectionFilterBackwardRelationsPlugin'
    );
  });

  it('exposes the three schema hooks we rely on', () => {
    const hooks = PostgisSpatialRelationsPlugin.schema?.hooks as Record<
      string,
      unknown
    > | undefined;
    expect(hooks).toBeDefined();
    expect(typeof hooks!.build).toBe('function');
    expect(typeof hooks!.init).toBe('function');
    expect(typeof hooks!.GraphQLInputObjectType_fields).toBe('function');
  });

  it('is wired into the GraphilePostgisPreset', () => {
    const plugins = (GraphilePostgisPreset.plugins ?? []) as Array<{
      name?: string;
    }>;
    const names = plugins.map((p) => p.name).filter(Boolean);
    expect(names).toContain('PostgisSpatialRelationsPlugin');
  });
});
