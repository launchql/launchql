module.exports = function PgConnectionArgFilterPostgisOperatorsPlugin(builder) {
  builder.hook("init", (_, build) => {
    const {
      addConnectionFilterOperator,
      inflection,
      pgSql: sql,
      pgGISExtension,
      pgGISGeographyType,
      pgGISGeometryType,
    } = build;

    if (!pgGISExtension || !pgGISGeographyType || !pgGISGeometryType) {
      return _;
    }

    const GEOGRAPHY = pgGISGeographyType.name;
    const GEOMETRY = pgGISGeometryType.name;

    const gqlTypeNamesByGisBaseTypeName = {
      geography: [],
      geometry: [],
    };
    gqlTypeNamesByGisBaseTypeName.geography.push(
      inflection.gisInterfaceName(pgGISGeographyType)
    );
    gqlTypeNamesByGisBaseTypeName.geometry.push(
      inflection.gisInterfaceName(pgGISGeometryType)
    );
    for (const subtype of [0, 1, 2, 3, 4, 5, 6, 7]) {
      for (const hasZ of [false, true]) {
        for (const hasM of [false, true]) {
          gqlTypeNamesByGisBaseTypeName.geography.push(
            inflection.gisType(pgGISGeographyType, subtype, hasZ, hasM)
          );
          gqlTypeNamesByGisBaseTypeName.geometry.push(
            inflection.gisType(pgGISGeometryType, subtype, hasZ, hasM)
          );
        }
      }
    }

    let specs = [];

    // Functions
    for (const [fn, baseTypeNames, operatorName, description] of [
      [
        "ST_3DIntersects",
        [GEOMETRY],
        "intersects3D",
        "They share any portion of space in 3D.",
      ],
      [
        "ST_Contains",
        [GEOMETRY],
        "contains",
        "No points of the specified geometry lie in the exterior, and at least one point of the interior of the specified geometry lies in the interior.",
      ],
      [
        "ST_ContainsProperly",
        [GEOMETRY],
        "containsProperly",
        "The specified geometry intersects the interior but not the boundary (or exterior).",
      ],
      [
        "ST_CoveredBy",
        [GEOMETRY, GEOGRAPHY],
        "coveredBy",
        "No point is outside the specified geometry.",
      ],
      [
        "ST_Covers",
        [GEOMETRY, GEOGRAPHY],
        "covers",
        "No point in the specified geometry is outside.",
      ],
      [
        "ST_Crosses",
        [GEOMETRY],
        "crosses",
        "They have some, but not all, interior points in common.",
      ],
      [
        "ST_Disjoint",
        [GEOMETRY],
        "disjoint",
        "They do not share any space together.",
      ],
      [
        "ST_Equals",
        [GEOMETRY],
        "equals",
        "They represent the same geometry. Directionality is ignored.",
      ],
      [
        "ST_Intersects",
        [GEOMETRY, GEOGRAPHY],
        "intersects",
        "They share any portion of space in 2D.",
      ],
      [
        "ST_OrderingEquals",
        [GEOMETRY],
        "orderingEquals",
        "They represent the same geometry and points are in the same directional order.",
      ],
      [
        "ST_Overlaps",
        [GEOMETRY],
        "overlaps",
        "They share space, are of the same dimension, but are not completely contained by each other.",
      ],
      [
        "ST_Touches",
        [GEOMETRY],
        "touches",
        "They have at least one point in common, but their interiors do not intersect.",
      ],
      [
        "ST_Within",
        [GEOMETRY],
        "within",
        "Completely inside the specified geometry.",
      ],
    ]) {
      for (const baseTypeName of baseTypeNames) {
        const sqlGisFunction =
          pgGISExtension.namespaceName === "public"
            ? sql.identifier(fn.toLowerCase())
            : sql.identifier(pgGISExtension.namespaceName, fn.toLowerCase());
        specs.push({
          typeNames: gqlTypeNamesByGisBaseTypeName[baseTypeName],
          operatorName,
          description,
          resolveType: fieldType => fieldType,
          resolve: (i, v) => sql.query`${sqlGisFunction}(${i}, ${v})`,
        });
      }
    }

    // Operators
    for (const [op, baseTypeNames, operatorName, description] of [
      [
        "=",
        [GEOMETRY, GEOGRAPHY],
        "exactlyEquals",
        "Coordinates and coordinate order are the same as specified geometry.",
      ],
      [
        "&&",
        [GEOMETRY, GEOGRAPHY],
        "bboxIntersects2D",
        "2D bounding box intersects the specified geometry's 2D bounding box.",
      ],
      [
        "&&&",
        [GEOMETRY],
        "bboxIntersectsND",
        "n-D bounding box intersects the specified geometry's n-D bounding box.",
      ],
      [
        "&<",
        [GEOMETRY],
        "bboxOverlapsOrLeftOf",
        "Bounding box overlaps or is to the left of the specified geometry's bounding box.",
      ],
      [
        "&<|",
        [GEOMETRY],
        "bboxOverlapsOrBelow",
        "Bounding box overlaps or is below the specified geometry's bounding box.",
      ],
      [
        "&>",
        [GEOMETRY],
        "bboxOverlapsOrRightOf",
        "Bounding box overlaps or is to the right of the specified geometry's bounding box.",
      ],
      [
        "|&>",
        [GEOMETRY],
        "bboxOverlapsOrAbove",
        "Bounding box overlaps or is above the specified geometry's bounding box.",
      ],
      [
        "<<",
        [GEOMETRY],
        "bboxLeftOf",
        "Bounding box is strictly to the left of the specified geometry's bounding box.",
      ],
      [
        "<<|",
        [GEOMETRY],
        "bboxBelow",
        "Bounding box is strictly below the specified geometry's bounding box.",
      ],
      [
        ">>",
        [GEOMETRY],
        "bboxRightOf",
        "Bounding box is strictly to the right of the specified geometry's bounding box.",
      ],
      [
        "|>>",
        [GEOMETRY],
        "bboxAbove",
        "Bounding box is strictly above the specified geometry's bounding box.",
      ],
      [
        "~",
        [GEOMETRY],
        "bboxContains",
        "Bounding box contains the specified geometry's bounding box.",
      ],
      [
        "~=",
        [GEOMETRY],
        "bboxEquals",
        "Bounding box is the same as the specified geometry's bounding box.",
      ],
    ]) {
      for (const baseTypeName of baseTypeNames) {
        specs.push({
          typeNames: gqlTypeNamesByGisBaseTypeName[baseTypeName],
          operatorName,
          description,
          resolveType: fieldType => fieldType,
          resolve: (i, v) => sql.query`${i} ${sql.raw(op)} ${v}`,
        });
      }
    }

    specs.sort((a, b) => (a.operatorName > b.operatorName ? 1 : -1));

    specs.forEach(
      ({ typeNames, operatorName, description, resolveType, resolve }) => {
        addConnectionFilterOperator(
          typeNames,
          operatorName,
          description,
          resolveType,
          resolve
        );
      }
    );

    return _;
  });
};
