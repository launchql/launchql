import 'graphile-build';
import 'graphile-build-pg';
import 'graphile-connection-filter';

import type { GraphileConfig } from 'graphile-config';
import type { SQL } from 'pg-sql2';
import sql from 'pg-sql2';

import type { PostgisExtensionInfo } from './detect-extension';

/**
 * PostgisSpatialRelationsPlugin
 *
 * Adds cross-table spatial filtering to `graphile-connection-filter` by
 * reading a `@spatialRelation` smart tag on geometry/geography columns and
 * synthesising a virtual relation + filter field that emits an EXISTS
 * subquery joined by a PostGIS predicate (e.g. `ST_Contains`, `ST_DWithin`).
 *
 * The regular `ConnectionFilterBackwardRelationsPlugin` is FK-driven — it
 * joins on column equality. Spatial relationships are not backed by FKs, so
 * this plugin hooks the same `pgCodec`-scoped filter input types and injects
 * its own fields whose `apply()` emits `ST_<op>(...)` instead of `a = b`.
 *
 * Tag grammar:
 *
 * ```sql
 * COMMENT ON COLUMN <owner_table>.<owner_col> IS
 *   E'@spatialRelation <relation_name> <target_ref> <operator> [<param_name>]';
 * ```
 *
 * - `target_ref` — `schema.table.col` or `table.col` (same schema as owner).
 * - `operator` — one of the PG-native snake_case ops in OPERATOR_REGISTRY.
 * - `param_name` — required iff the operator is parametric (currently
 *   only `st_dwithin`, which needs a distance).
 *
 * Examples:
 *
 * ```sql
 * -- Point in polygon
 * COMMENT ON COLUMN telemedicine_clinics.location IS
 *   E'@spatialRelation county counties.geom st_contains';
 *
 * -- Self-referential radius search
 * COMMENT ON COLUMN telemedicine_clinics.location IS
 *   E'@spatialRelation nearbyClinic telemedicine_clinics.location st_dwithin distance';
 * ```
 *
 * Generated GraphQL (for the `st_dwithin` case):
 *
 * ```graphql
 * telemedicineClinics(where: {
 *   nearbyClinic: {
 *     distance: 5000,
 *     some: { specialty: { eq: "pediatrics" } }
 *   }
 * })
 * ```
 *
 * The generated SQL uses the same EXISTS pattern as backward relations but
 * substitutes `ST_<op>(...)` for column equality:
 *
 * ```sql
 * WHERE EXISTS (
 *   SELECT 1 FROM <target_table> other
 *   WHERE ST_<op>(other.<target_col>, self.<owner_col>[, distance])
 *     AND other.<pk> <> self.<pk>  -- self-relations only
 *     AND <nested filter conditions>
 * )
 * ```
 */

export interface SpatialOperatorRegistration {
  /** Tag-facing op name (PG-native snake_case). */
  name: string;
  /** Kind of PG-level operator. */
  kind: 'function' | 'infix';
  /**
   * For `kind: 'function'`, the PG function name (snake_case) resolved
   * against the PostGIS schema at SQL-emit time. For `kind: 'infix'`,
   * the PG binary operator token (e.g. `&&`).
   */
  pgToken: string;
  /** Whether this op takes an extra numeric parameter (e.g. `st_dwithin`). */
  parametric: boolean;
  description: string;
}

export const OPERATOR_REGISTRY: Record<string, SpatialOperatorRegistration> = {
  st_contains: {
    name: 'st_contains',
    kind: 'function',
    pgToken: 'st_contains',
    parametric: false,
    description:
      'Every point of the owner column lies in the interior of the target column (ST_Contains).',
  },
  st_within: {
    name: 'st_within',
    kind: 'function',
    pgToken: 'st_within',
    parametric: false,
    description:
      'Owner column is completely inside the target column (ST_Within).',
  },
  st_covers: {
    name: 'st_covers',
    kind: 'function',
    pgToken: 'st_covers',
    parametric: false,
    description:
      'No point in the target column lies outside the owner column (ST_Covers).',
  },
  st_coveredby: {
    name: 'st_coveredby',
    kind: 'function',
    pgToken: 'st_coveredby',
    parametric: false,
    description:
      'No point in the owner column lies outside the target column (ST_CoveredBy).',
  },
  st_intersects: {
    name: 'st_intersects',
    kind: 'function',
    pgToken: 'st_intersects',
    parametric: false,
    description:
      'Owner and target columns share any portion of space (ST_Intersects).',
  },
  st_equals: {
    name: 'st_equals',
    kind: 'function',
    pgToken: 'st_equals',
    parametric: false,
    description:
      'Owner and target columns represent the same geometry (ST_Equals).',
  },
  st_bbox_intersects: {
    name: 'st_bbox_intersects',
    kind: 'infix',
    pgToken: '&&',
    parametric: false,
    description:
      "Owner column's 2D bounding box intersects the target's 2D bounding box (&&).",
  },
  st_dwithin: {
    name: 'st_dwithin',
    kind: 'function',
    pgToken: 'st_dwithin',
    parametric: true,
    description:
      'Owner column is within <distance> of the target column (ST_DWithin). ' +
      'Distance is in meters for geography, SRID coordinate units for geometry.',
  },
};

export interface SpatialRelationInfo {
  /** GraphQL-facing relation name, derived from the tag. */
  relationName: string;
  /** The codec that owns the tag (outer side of the EXISTS). */
  ownerCodec: any;
  /** The owning attribute name (column). */
  ownerAttributeName: string;
  /** Qualified target resource (inner side of the EXISTS). */
  targetResource: any;
  /** Column name on the target resource. */
  targetAttributeName: string;
  /** Resolved operator. */
  operator: SpatialOperatorRegistration;
  /** Field name for the parametric argument, if any. */
  paramFieldName: string | null;
  /** Whether owner === target (self-relation needs row exclusion). */
  isSelfRelation: boolean;
  /**
   * Cached primary-key attribute names for the owner+target codecs. Used
   * to synthesise the self-exclusion predicate (`other.<pk> <> self.<pk>`).
   * `null` if the codec has no discoverable PK.
   */
  ownerPkAttributes: string[] | null;
  targetPkAttributes: string[] | null;
}

interface TagParseResult {
  ok: true;
  relationName: string;
  targetRef: string;
  operator: string;
  paramName: string | null;
}

interface TagParseError {
  ok: false;
  error: string;
}

/**
 * Parse a single `@spatialRelation` tag value.
 *
 * Accepts a string of the form `<name> <target> <op> [<param>]`.
 */
export function parseSpatialRelationTag(raw: string): TagParseResult | TagParseError {
  if (typeof raw !== 'string') {
    return { ok: false, error: `Expected string, got ${typeof raw}` };
  }
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 3 || parts.length > 4) {
    return {
      ok: false,
      error: `Expected 3 or 4 whitespace-separated tokens; got ${parts.length}`,
    };
  }
  const [relationName, targetRef, operator, paramName] = parts;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(relationName)) {
    return { ok: false, error: `Invalid relation name '${relationName}'` };
  }
  if (!/^[A-Za-z_][A-Za-z0-9_.]*$/.test(targetRef)) {
    return { ok: false, error: `Invalid target reference '${targetRef}'` };
  }
  const targetParts = targetRef.split('.');
  if (targetParts.length < 2 || targetParts.length > 3) {
    return {
      ok: false,
      error: `Target must be 'table.col' or 'schema.table.col'; got '${targetRef}'`,
    };
  }
  if (!(operator in OPERATOR_REGISTRY)) {
    const known = Object.keys(OPERATOR_REGISTRY).sort().join(', ');
    return {
      ok: false,
      error: `Unknown spatial operator '${operator}'. Known ops: ${known}`,
    };
  }
  const op = OPERATOR_REGISTRY[operator];
  if (op.parametric) {
    if (!paramName) {
      return {
        ok: false,
        error: `Operator '${operator}' requires a parameter name (e.g. 'distance')`,
      };
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(paramName)) {
      return { ok: false, error: `Invalid param name '${paramName}'` };
    }
  } else {
    if (paramName) {
      return {
        ok: false,
        error: `Operator '${operator}' does not take a parameter; got extra token '${paramName}'`,
      };
    }
  }
  return {
    ok: true,
    relationName,
    targetRef,
    operator,
    paramName: paramName ?? null,
  };
}

/**
 * Resolve a `<table.col>` or `<schema.table.col>` reference to a
 * `pgResource` + attribute name.
 */
function resolveTargetRef(
  pgRegistry: any,
  ownerResource: any,
  targetRef: string
): { resource: any; attributeName: string } | null {
  const parts = targetRef.split('.');
  let schemaName: string | null = null;
  let tableName: string;
  let columnName: string;
  if (parts.length === 2) {
    [tableName, columnName] = parts;
  } else {
    [schemaName, tableName, columnName] = parts;
  }
  const ownerPgExt = ownerResource?.codec?.extensions?.pg;
  const defaultSchema = ownerPgExt?.schemaName ?? 'public';
  const lookupSchema = schemaName ?? defaultSchema;

  for (const res of Object.values(pgRegistry.pgResources) as any[]) {
    if (res.parameters) continue;
    const pg = res?.codec?.extensions?.pg;
    if (!pg) continue;
    if (pg.name !== tableName) continue;
    if (pg.schemaName !== lookupSchema) continue;
    const attr = res.codec.attributes?.[columnName];
    if (!attr) return null;
    return { resource: res, attributeName: columnName };
  }
  return null;
}

/** Get the PK attribute names for a resource, or null if none discoverable. */
function getPrimaryKeyAttributes(resource: any): string[] | null {
  const uniques = resource?.uniques as any[] | undefined;
  if (!uniques || uniques.length === 0) return null;
  const primary = uniques.find((u) => u.isPrimary);
  const chosen = primary ?? uniques[0];
  if (!chosen?.attributes || chosen.attributes.length === 0) return null;
  return chosen.attributes as string[];
}

/**
 * Collect tag strings from an attribute, handling the `string | string[]`
 * normalisation graphile-build-pg does for repeated smart tags.
 */
function collectTagStrings(tagValue: unknown): string[] {
  if (tagValue == null) return [];
  if (Array.isArray(tagValue)) {
    return tagValue.filter((v): v is string => typeof v === 'string');
  }
  if (typeof tagValue === 'string') return [tagValue];
  return [];
}

/**
 * Build the full set of spatial relations from all resources.
 * Validates tags and throws (at schema build) on anything malformed.
 * Returns relations keyed by (owner codec identity, relation name).
 */
export function collectSpatialRelations(build: any): SpatialRelationInfo[] {
  const pgRegistry = build.input?.pgRegistry;
  if (!pgRegistry) return [];

  // Inflection is used to normalize user-supplied identifiers (the
  // parametric arg name, e.g. `travel_distance` → `travelDistance`) into the
  // GraphQL casing conventions. Fall back to identity if not available
  // (e.g. when invoked from unit tests with a stub build).
  const camelCase: (s: string) => string =
    build.inflection?.camelCase?.bind(build.inflection) ?? ((s: string) => s);

  const relations: SpatialRelationInfo[] = [];

  for (const resource of Object.values(pgRegistry.pgResources) as any[]) {
    if (resource.parameters) continue;
    const attributes = resource.codec?.attributes;
    if (!attributes) continue;

    for (const [ownerAttributeName, attribute] of Object.entries(
      attributes as Record<string, any>
    )) {
      const tags = attribute?.extensions?.tags;
      if (!tags) continue;
      const rawValues = collectTagStrings(tags.spatialRelation);
      if (rawValues.length === 0) continue;

      for (const rawValue of rawValues) {
        const parsed = parseSpatialRelationTag(rawValue);
        if (parsed.ok !== true) {
          throw new Error(
            `[graphile-postgis] Invalid @spatialRelation tag on ` +
            `${resource.codec.name}.${ownerAttributeName}: ${parsed.error}`
          );
        }

        const target = resolveTargetRef(pgRegistry, resource, parsed.targetRef);
        if (!target) {
          throw new Error(
            `[graphile-postgis] @spatialRelation tag on ` +
            `${resource.codec.name}.${ownerAttributeName} references ` +
            `'${parsed.targetRef}' which does not resolve to a known column.`
          );
        }

        // Validate geometry/geography codec symmetry.
        const ownerPgExt = attribute.codec?.extensions?.pg;
        const targetAttr = target.resource.codec.attributes[target.attributeName];
        const targetPgExt = targetAttr?.codec?.extensions?.pg;
        const ownerBase = ownerPgExt?.name;
        const targetBase = targetPgExt?.name;
        if (
          (ownerBase === 'geometry' || ownerBase === 'geography') &&
          (targetBase === 'geometry' || targetBase === 'geography') &&
          ownerBase !== targetBase
        ) {
          throw new Error(
            `[graphile-postgis] @spatialRelation ${resource.codec.name}.${ownerAttributeName} ` +
            `-> ${target.resource.codec.name}.${target.attributeName}: ` +
            `codec mismatch (${ownerBase} vs ${targetBase}). Both sides must share a base codec.`
          );
        }
        if (
          ownerBase !== 'geometry' &&
          ownerBase !== 'geography'
        ) {
          throw new Error(
            `[graphile-postgis] @spatialRelation requires a geometry or geography column; ` +
            `${resource.codec.name}.${ownerAttributeName} is ${ownerBase ?? 'unknown'}.`
          );
        }

        const isSelfRelation = resource === target.resource;
        const ownerPkAttributes = getPrimaryKeyAttributes(resource);
        const targetPkAttributes = getPrimaryKeyAttributes(target.resource);
        if (isSelfRelation && !ownerPkAttributes) {
          throw new Error(
            `[graphile-postgis] @spatialRelation '${parsed.relationName}' on ` +
            `${resource.codec.name}.${ownerAttributeName} is a self-relation, but the ` +
            `table has no primary key; refusing to register (would match every row against itself).`
          );
        }

        relations.push({
          relationName: parsed.relationName,
          ownerCodec: resource.codec,
          ownerAttributeName,
          targetResource: target.resource,
          targetAttributeName: target.attributeName,
          operator: OPERATOR_REGISTRY[parsed.operator],
          paramFieldName: parsed.paramName ? camelCase(parsed.paramName) : null,
          isSelfRelation,
          ownerPkAttributes,
          targetPkAttributes,
        });
      }
    }
  }

  // Detect duplicate (ownerCodec, relationName) pairs — emit a clear error
  // rather than letting registerInputObjectType throw generic "already exists".
  const seen = new Map<string, SpatialRelationInfo>();
  for (const rel of relations) {
    const key = `${rel.ownerCodec.name}:${rel.relationName}`;
    const prior = seen.get(key);
    if (prior) {
      throw new Error(
        `[graphile-postgis] Duplicate @spatialRelation name '${rel.relationName}' on ` +
        `codec '${rel.ownerCodec.name}'. Each relation name must be unique per owning table.`
      );
    }
    seen.set(key, rel);
  }

  return relations;
}

/** Name of the per-relation filter type: `<Owner>Spatial<Relation>Filter`. */
function spatialFilterTypeName(build: any, rel: SpatialRelationInfo): string {
  const { inflection } = build;
  const ownerTypeName = inflection.tableType(rel.ownerCodec);
  // Normalize the user-supplied relation name (which may be snake_case,
  // kebab-case, or mixed) into PascalCase so the type name is consistent
  // with every other generated GraphQL type name.
  const rel0 = inflection.upperCamelCase(rel.relationName);
  return `${ownerTypeName}Spatial${rel0}Filter`;
}

/**
 * Build the SQL fragment that joins the inner (target) row to the outer
 * (owner) row using the resolved PostGIS predicate.
 */
export function buildSpatialJoinFragment(
  rel: SpatialRelationInfo,
  schemaName: string,
  outerAlias: SQL,
  innerAlias: SQL,
  distanceValue: SQL | null
): SQL {
  // Tag grammar reads as "<owner_col> <op> <target_col>" (e.g. "location
  // st_within counties.geom"), so the emitted PostGIS call is always
  // `ST_<op>(owner_col, target_col)`. For symmetric operators
  // (st_intersects, st_dwithin, st_equals, &&) the ordering is immaterial;
  // for directional ones (st_within, st_contains, st_covers, st_coveredby)
  // reversing the operands inverts the set of matched rows.
  const ownerExpr = sql`${outerAlias}.${sql.identifier(rel.ownerAttributeName)}`;
  const targetExpr = sql`${innerAlias}.${sql.identifier(rel.targetAttributeName)}`;
  if (rel.operator.kind === 'infix') {
    // Only `&&` today. Bind it to this build's exact PostGIS namespace.
    return sql`${ownerExpr} OPERATOR(${sql.identifier(schemaName)}.&&) ${targetExpr}`;
  }
  const fn = sql.identifier(schemaName, rel.operator.pgToken);
  if (rel.operator.parametric) {
    if (!distanceValue) {
      // The apply() guards this; defensive throw.
      throw new Error(
        `[graphile-postgis] Parametric operator '${rel.operator.name}' invoked without ` +
        `a distance value in spatial relation '${rel.relationName}'.`
      );
    }
    return sql`${fn}(${ownerExpr}, ${targetExpr}, ${distanceValue})`;
  }
  return sql`${fn}(${ownerExpr}, ${targetExpr})`;
}

/** Build the `other.pk <> self.pk` exclusion predicate for self-relations. */
function buildSelfExclusionFragment(
  rel: SpatialRelationInfo,
  outerAlias: SQL,
  innerAlias: SQL
): SQL | null {
  if (!rel.isSelfRelation) return null;
  const pk = rel.ownerPkAttributes;
  if (!pk || pk.length === 0) return null;
  if (pk.length === 1) {
    const c = pk[0];
    return sql`${innerAlias}.${sql.identifier(c)} <> ${outerAlias}.${sql.identifier(c)}`;
  }
  // Composite PK: IS DISTINCT FROM tuple comparison.
  const left = sql.join(
    pk.map((c) => sql`${innerAlias}.${sql.identifier(c)}`),
    ', '
  );
  const right = sql.join(
    pk.map((c) => sql`${outerAlias}.${sql.identifier(c)}`),
    ', '
  );
  return sql`(${left}) IS DISTINCT FROM (${right})`;
}

export const PostgisSpatialRelationsPlugin: GraphileConfig.Plugin = {
  name: 'PostgisSpatialRelationsPlugin',
  version: '1.0.0',
  description:
    'Adds cross-table spatial filtering via @spatialRelation smart tags; ' +
    'synthesises virtual relations whose EXISTS predicate uses PostGIS ops ' +
    'instead of column equality.',
  after: [
    'PostgisExtensionDetectionPlugin',
    'PostgisRegisterTypesPlugin',
    'ConnectionFilterBackwardRelationsPlugin',
  ],

  schema: {
    hooks: {
      build(build) {
        const postgisInfo: PostgisExtensionInfo | undefined =
          (build as any).pgGISExtensionInfo;
        if (!postgisInfo) return build;
        const relations = collectSpatialRelations(build);

        // Emit GIST-index warnings for target columns without a GIST index.
        // Warnings never block schema build — we defer to the build logger.
        const warn = (build as any).console?.warn ?? console.warn;
        for (const rel of relations) {
          const targetAttr =
            rel.targetResource.codec.attributes?.[rel.targetAttributeName];
          const indexes = rel.targetResource.extensions?.pg?.indexes as
            | any[]
            | undefined;
          let hasGist = false;
          if (Array.isArray(indexes)) {
            hasGist = indexes.some(
              (idx) =>
                idx &&
                typeof idx === 'object' &&
                idx.method === 'gist' &&
                Array.isArray(idx.attributes) &&
                idx.attributes.includes(rel.targetAttributeName)
            );
          }
          // Introspection of indexes through @dataplan/pg isn't universally
          // exposed; if we can't tell, stay quiet rather than cry wolf.
          const canDiscoverIndexes = Array.isArray(indexes);
          const skipCheck =
            targetAttr?.extensions?.tags?.spatialRelationSkipIndexCheck === true;
          if (canDiscoverIndexes && !hasGist && !skipCheck) {
            warn(
              `[graphile-postgis] Spatial relation '${rel.relationName}' ` +
              `targets ${rel.targetResource.codec.name}.${rel.targetAttributeName} ` +
              `which has no GIST index; expect sequential scans. ` +
              `Recommended: CREATE INDEX ON ${rel.targetResource.codec.name} ` +
              `USING GIST (${rel.targetAttributeName});`
            );
          }
        }

        return build.extend(
          build,
          { pgGISSpatialRelations: relations },
          'PostgisSpatialRelationsPlugin adding spatial relation registry'
        );
      },

      init(_, build) {
        if (!(build as any).pgGISExtensionInfo) return _;
        const relations = (build as any).pgGISSpatialRelations as
          | SpatialRelationInfo[]
          | undefined;
        if (!relations || relations.length === 0) return _;

        for (const rel of relations) {
          const typeName = spatialFilterTypeName(build, rel);
          if (build.getTypeMetaByName(typeName)) continue;
          const targetTypeName = build.inflection.tableType(
            rel.targetResource.codec
          );
          build.recoverable(null, () => {
            build.registerInputObjectType(
              typeName,
              {
                // NOTE: intentionally NOT setting `isPgConnectionFilterMany`.
                // That flag triggers ConnectionFilterBackwardRelationsPlugin
                // (and friends) to auto-register `some`/`every`/`none` fields
                // with FK-join semantics, which would collide with — and
                // semantically differ from — ours. We own those fields here.
                foreignTable: rel.targetResource,
                isPgGISSpatialFilter: true,
                pgGISSpatialRelation: rel,
              } as any,
              () => ({
                name: typeName,
                description:
                  `A filter on \`${targetTypeName}\` rows spatially related ` +
                  `to the current row via \`${rel.operator.name}\`. ` +
                  `All fields are combined with a logical \u2018and\u2019.`,
              }),
              `PostgisSpatialRelationsPlugin adding '${typeName}' spatial filter type`
            );
          });
        }
        return _;
      },

      GraphQLInputObjectType_fields(inFields, build, context) {
        if (!(build as any).pgGISExtensionInfo) return inFields;
        const relations = (build as any).pgGISSpatialRelations as
          | SpatialRelationInfo[]
          | undefined;
        if (!relations || relations.length === 0) return inFields;

        let fields = inFields;
        const {
          extend,
          inflection,
          graphql: { GraphQLFloat, GraphQLNonNull },
          EXPORTABLE,
        } = build;
        const {
          fieldWithHooks,
          scope: {
            pgCodec,
            isPgConnectionFilter,
            isPgGISSpatialFilter,
            pgGISSpatialRelation,
          },
        } = context as any;

        const postgisInfo: PostgisExtensionInfo = (build as any).pgGISExtensionInfo;
        const { schemaName } = postgisInfo;

        // ── Part 1: inject <relationName> on the owning codec's filter type
        if (isPgConnectionFilter && pgCodec) {
          const ownRelations = relations.filter(
            (r) => r.ownerCodec === pgCodec
          );
          for (const rel of ownRelations) {
            const filterTypeName = spatialFilterTypeName(build, rel);
            const FilterType = build.getTypeByName(filterTypeName);
            if (!FilterType) continue;

            // Normalize the user-supplied relation name (which may be
            // snake_case, kebab-case, or mixed) into camelCase so the GraphQL
            // field name matches the casing of every other generated field.
            const fieldName = inflection.camelCase(rel.relationName);
            // Avoid clobbering fields an upstream plugin may have registered
            // (e.g. an FK-derived relation with the same name).
            if (fields[fieldName]) {
              throw new Error(
                `[graphile-postgis] @spatialRelation '${rel.relationName}' on ` +
                `codec '${rel.ownerCodec.name}' collides with an existing filter ` +
                `field of the same name. Rename the spatial relation or the colliding field.`
              );
            }

            const targetTypeName = inflection.tableType(
              rel.targetResource.codec
            );
            const relSnapshot = rel;
            fields = extend(
              fields,
              {
                [fieldName]: fieldWithHooks(
                  {
                    fieldName,
                    isPgConnectionFilterField: true,
                    isPgGISSpatialRelationField: true,
                  } as any,
                  () => ({
                    description:
                      `Filter by rows from \`${targetTypeName}\` related to this ` +
                      `row via \`${relSnapshot.operator.name}\`.`,
                    type: FilterType,
                    apply: EXPORTABLE(
                      (relationInfo: SpatialRelationInfo) =>
                        function ($where: any, value: any) {
                          if (value == null) return;
                          $where._spatialRelation = relationInfo;
                          // Parent apply runs BEFORE child field applies, so
                          // read the parametric value here (if any) and stash
                          // it on $where for some/every/none to consume. This
                          // avoids relying on input-field iteration order.
                          if (
                            relationInfo.operator.parametric &&
                            relationInfo.paramFieldName
                          ) {
                            const raw = value[relationInfo.paramFieldName];
                            if (typeof raw !== 'number') {
                              throw Object.assign(
                                new Error(
                                  `Spatial relation '${relationInfo.relationName}' requires ` +
                                  `a numeric '${relationInfo.paramFieldName}' argument; got ${raw}`
                                ),
                                {}
                              );
                            }
                            $where._spatialRelationParam = raw;
                          }
                          return $where;
                        },
                      [relSnapshot]
                    ),
                  })
                ),
              },
              `PostgisSpatialRelationsPlugin adding '${fieldName}' field to ` +
              `${inflection.filterType(inflection.tableType(rel.ownerCodec))}`
            );
          }
        }

        // ── Part 2: inject some/every/none (+ optional distance) on the
        // per-relation filter type.
        if (isPgGISSpatialFilter && pgGISSpatialRelation) {
          const rel: SpatialRelationInfo = pgGISSpatialRelation;
          const targetTypeName = inflection.tableType(rel.targetResource.codec);
          const TargetFilterTypeName = inflection.filterType(targetTypeName);
          const TargetFilterType = build.getTypeByName(TargetFilterTypeName);
          if (!TargetFilterType) return fields;

          const paramFieldName = rel.paramFieldName;

          // Parametric: add required <param> field (Float!). The parent
          // relation field's apply reads the value from the input object
          // directly — this field's apply is a no-op used only so the schema
          // validates the input shape.
          if (rel.operator.parametric && paramFieldName) {
            fields = extend(
              fields,
              {
                [paramFieldName]: fieldWithHooks(
                  {
                    fieldName: paramFieldName,
                    isPgConnectionFilterField: true,
                    isPgGISSpatialParamField: true,
                  } as any,
                  () => ({
                    description:
                      `Parametric argument for ${rel.operator.name} ` +
                      `(units: meters for geography, SRID units for geometry).`,
                    type: new GraphQLNonNull(GraphQLFloat),
                    apply: EXPORTABLE(
                      () =>
                        function (_$where: any, _value: number | null) {
                          // No-op; parent apply already stashed the value.
                        },
                      []
                    ),
                  })
                ),
              },
              `PostgisSpatialRelationsPlugin adding '${paramFieldName}' param to ` +
              `${spatialFilterTypeName(build, rel)}`
            );
          }

          // Build the three apply() closures. `mode` selects the EXISTS
          // variant: `'some'` => EXISTS, `'none'` => NOT EXISTS,
          // `'every'` => NOT EXISTS (... AND NOT filter) via notPlan().
          const buildApply = (mode: 'some' | 'every' | 'none') =>
            EXPORTABLE(
              (
                buildJoin: typeof buildSpatialJoinFragment,
                buildExcl: typeof buildSelfExclusionFragment,
                relationInfo: SpatialRelationInfo,
                sqlSchemaName: string,
                sqlLib: typeof sql,
                applyMode: 'some' | 'every' | 'none'
              ) =>
                function ($where: any, value: object | null) {
                  if (value == null) return;
                  const foreignTable = relationInfo.targetResource;
                  const foreignTableExpression = foreignTable.from;
                  const existsOpts: Record<string, unknown> = {
                    tableExpression: foreignTableExpression,
                    alias: foreignTable.name,
                  };
                  if (applyMode !== 'some') {
                    existsOpts.equals = false;
                  }
                  const $subQuery = $where.existsPlan(existsOpts);
                  const outerAlias = $where.alias;
                  const innerAlias = $subQuery.alias;
                  let distance: SQL | null = null;
                  if (relationInfo.operator.parametric) {
                    const raw = $where._spatialRelationParam;
                    if (raw == null || typeof raw !== 'number') {
                      throw Object.assign(
                        new Error(
                          `Spatial relation '${relationInfo.relationName}' requires a ` +
                          `'${relationInfo.paramFieldName}' value; got ${raw}`
                        ),
                        {}
                      );
                    }
                    distance = sqlLib.value(raw);
                  }
                  $subQuery.where(
                    buildJoin(
                      relationInfo,
                      sqlSchemaName,
                      outerAlias,
                      innerAlias,
                      distance
                    )
                  );
                  const exclusion = buildExcl(relationInfo, outerAlias, innerAlias);
                  if (exclusion) {
                    $subQuery.where(exclusion);
                  }
                  if (applyMode === 'every') {
                    return $subQuery.notPlan();
                  }
                  return $subQuery;
                },
              [
                buildSpatialJoinFragment,
                buildSelfExclusionFragment,
                rel,
                schemaName,
                sql,
                mode,
              ]
            );

          fields = extend(
            fields,
            {
              some: fieldWithHooks(
                {
                  fieldName: 'some',
                  isPgConnectionFilterField: true,
                } as any,
                () => ({
                  description:
                    'Filters to entities where at least one spatially-related entity matches.',
                  type: TargetFilterType,
                  apply: buildApply('some'),
                })
              ),
              every: fieldWithHooks(
                {
                  fieldName: 'every',
                  isPgConnectionFilterField: true,
                } as any,
                () => ({
                  description:
                    'Filters to entities where every spatially-related entity matches.',
                  type: TargetFilterType,
                  apply: buildApply('every'),
                })
              ),
              none: fieldWithHooks(
                {
                  fieldName: 'none',
                  isPgConnectionFilterField: true,
                } as any,
                () => ({
                  description:
                    'Filters to entities where no spatially-related entity matches.',
                  type: TargetFilterType,
                  apply: buildApply('none'),
                })
              ),
            },
            `PostgisSpatialRelationsPlugin adding some/every/none to ${spatialFilterTypeName(build, rel)}`
          );
        }

        return fields;
      },
    },
  },
};
