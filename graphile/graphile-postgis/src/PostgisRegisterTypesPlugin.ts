import type { Build, InitObject, Plugin } from 'graphile-build';
import type { PgType } from 'graphile-build-pg';
import type { SQL } from 'graphile-build-pg/node8plus/QueryBuilder';
import type {
  GraphQLInterfaceType,
  GraphQLOutputType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchemaConfig
} from 'graphql';

import { GisSubtype } from './constants';
import makeGeoJSONType from './makeGeoJSONType';
import { getGISTypeDetails, getGISTypeModifier, getGISTypeName } from './utils';
import type { GisFieldValue, GisGraphQLType, GisTypeDetails, PostgisBuild } from './types';

const SUBTYPES: GisSubtype[] = [
  GisSubtype.Point,
  GisSubtype.LineString,
  GisSubtype.Polygon,
  GisSubtype.MultiPoint,
  GisSubtype.MultiLineString,
  GisSubtype.MultiPolygon,
  GisSubtype.GeometryCollection
];

const identity = <T>(input: T): T => input;

const PostgisRegisterTypesPlugin: Plugin = (builder) => {
  builder.hook('build', (build: Build): Build => {
    const rawBuild = build as PostgisBuild;
    const GeoJSON = makeGeoJSONType(rawBuild.graphql, rawBuild.inflection.builtin('GeoJSON'));
    rawBuild.addType(GeoJSON);

    return rawBuild.extend(rawBuild, {
      getPostgisTypeByGeometryType(
        this: PostgisBuild,
        pgGISType: PgType,
        subtype: GisSubtype,
        hasZ: boolean = false,
        hasM: boolean = false,
        srid: number = 0
      ) {
        const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, srid);
        return this.pgGetGqlTypeByTypeIdAndModifier(pgGISType.id, typeModifier);
      },
      pgGISIncludedTypes: [] as GisGraphQLType[],
      pgGISIncludeType(this: PostgisBuild, Type: GisGraphQLType) {
        this.pgGISIncludedTypes.push(Type);
      }
    }) as Build;
  });

  builder.hook(
    'init',
    (input: InitObject, build: Build) => {
      const rawBuild = build as PostgisBuild;
      const {
        newWithHooks,
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        graphql: { GraphQLInt, GraphQLNonNull, GraphQLInterfaceType, GraphQLObjectType },
        pgRegisterGqlTypeByTypeId,
        pgRegisterGqlInputTypeByTypeId,
        pgTweaksByTypeIdAndModifer,
        getTypeByName,
        pgSql: sql,
        pg2gql,
        pg2GqlMapper,
        inflection,
        pgGISGraphQLTypesByTypeAndSubtype: constructedTypes,
        pgGISGraphQLInterfaceTypesByType: interfacesMap,
        pgGISGeometryType: GEOMETRY_TYPE,
        pgGISGeographyType: GEOGRAPHY_TYPE,
        pgGISExtension: POSTGIS,
        pgGISIncludeType: includeType
      } = rawBuild;
      if (!GEOMETRY_TYPE || !GEOGRAPHY_TYPE) {
        return input;
      }
      console.warn('PostGIS plugin enabled');

      const GeoJSON = getTypeByName(inflection.builtin('GeoJSON')) as GraphQLScalarType | undefined;
      if (!GeoJSON) {
        throw new Error('GeoJSON type was not registered on the build');
      }
      const geojsonFieldName = inflection.geojsonFieldName();

      const ensureInterfaceStore = (type: PgType): void => {
        if (!interfacesMap[type.id]) {
          interfacesMap[type.id] = {};
        }
      };

      const getGisInterface = (type: PgType): GraphQLInterfaceType => {
        const zmflag = -1; // no dimensional constraint; could be xy/xyz/xym/xyzm
        ensureInterfaceStore(type);
        if (!interfacesMap[type.id][zmflag]) {
          interfacesMap[type.id][zmflag] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisInterfaceName(type),
              fields: {
                [geojsonFieldName]: {
                  type: GeoJSON,
                  description: 'Converts the object to GeoJSON'
                },
              srid: {
                  type: new GraphQLNonNull(GraphQLInt),
                  description: 'Spatial reference identifier (SRID)'
                }
              },
              resolveType(value: GisFieldValue) {
                const Type = constructedTypes[type.id]?.[value.__gisType];
                return Type instanceof GraphQLObjectType ? Type : undefined;
              },
              description: `All ${type.name} types implement this interface`
            },
            {
              isPgGISInterface: true,
              pgGISType: type,
              pgGISZMFlag: zmflag
            }
          );
          for (const subtype of SUBTYPES) {
            for (const hasZ of [false, true]) {
              for (const hasM of [false, true]) {
                const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, 0);
                const Type = getGisType(type, typeModifier);
                includeType(Type);
              }
            }
          }
        }
        return interfacesMap[type.id][zmflag];
      };
      const getGisDimensionInterface = (type: PgType, hasZ: boolean, hasM: boolean): GraphQLInterfaceType => {
        const zmflag = (hasZ ? 2 : 0) + (hasM ? 1 : 0); // Equivalent to ST_Zmflag: https://postgis.net/docs/ST_Zmflag.html
        const coords: Record<number, string> = { 0: 'XY', 1: 'XYM', 2: 'XYZ', 3: 'XYZM' };
        ensureInterfaceStore(type);
        if (!interfacesMap[type.id][zmflag]) {
          interfacesMap[type.id][zmflag] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisDimensionInterfaceName(type, hasZ, hasM),
              fields: {
                [geojsonFieldName]: {
                  type: GeoJSON,
                  description: 'Converts the object to GeoJSON'
                },
              srid: {
                  type: new GraphQLNonNull(GraphQLInt),
                  description: 'Spatial reference identifier (SRID)'
                }
              },
              resolveType(value: GisFieldValue) {
                const Type = constructedTypes[type.id]?.[value.__gisType];
                return Type instanceof GraphQLObjectType ? Type : undefined;
              },
              description: `All ${type.name} ${coords[zmflag]} types implement this interface`
            },
            {
              isPgGISDimensionInterface: true,
              pgGISType: type,
              pgGISZMFlag: zmflag
            }
          );
          for (const subtype of SUBTYPES) {
            const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, 0);
            const Type = getGisType(type, typeModifier);
            includeType(Type);
          }
        }
        return interfacesMap[type.id][zmflag];
      };
      const getGisType = (type: PgType, typeModifier: number): GisGraphQLType => {
        const typeId = type.id;
        const typeDetails: GisTypeDetails = getGISTypeDetails(typeModifier);
        const { subtype, hasZ, hasM, srid } = typeDetails;
        console.warn(
          `Getting ${type.name} type ${type.id}|${typeModifier}|${subtype}|${hasZ}|${hasM}|${srid}`
        );
        if (!constructedTypes[typeId]) {
          constructedTypes[typeId] = {};
        }
        const typeModifierKey = typeModifier ?? -1;
        if (!pgTweaksByTypeIdAndModifer[typeId]) {
          pgTweaksByTypeIdAndModifer[typeId] = {};
        }
        if (!pgTweaksByTypeIdAndModifer[typeId][typeModifierKey]) {
          pgTweaksByTypeIdAndModifer[typeId][typeModifierKey] = (fragment: SQL) => {
            const params = [
              sql.literal('__gisType'),
              sql.fragment`${sql.identifier(
                POSTGIS?.namespaceName || 'public',
                'postgis_type_name' // MUST be lowercase!
              )}(
                ${sql.identifier(
                  POSTGIS?.namespaceName || 'public',
                  'geometrytype' // MUST be lowercase!
                )}(${fragment}),
                ${sql.identifier(
                  POSTGIS?.namespaceName || 'public',
                  'st_coorddim' // MUST be lowercase!
                )}(${fragment}::text)
              )`,
              sql.literal('__srid'),
              sql.fragment`${sql.identifier(
                POSTGIS?.namespaceName || 'public',
                'st_srid' // MUST be lowercase!
              )}(${fragment})`,
              sql.literal('__geojson'),
              sql.fragment`${sql.identifier(
                POSTGIS?.namespaceName || 'public',
                'st_asgeojson' // MUST be lowercase!
              )}(${fragment})::JSON`
            ];
            return sql.fragment`(case when ${fragment} is null then null else json_build_object(
            ${sql.join(params, ', ')}
          ) end)`;
          };
        }
        const gisTypeKey: string | number =
          typeModifier != null ? getGISTypeName(subtype, hasZ, hasM) : -1;
        if (!constructedTypes[typeId][gisTypeKey]) {
          if (typeModifierKey === -1) {
            constructedTypes[typeId][gisTypeKey] = getGisInterface(type);
          } else if (subtype === GisSubtype.Geometry) {
            constructedTypes[typeId][gisTypeKey] = getGisDimensionInterface(
              type,
              hasZ,
              hasM
            );
          } else {
            const intType = introspectionResultsByKind.type.find(
              (introspectionType: PgType) =>
                introspectionType.name === 'int4' && introspectionType.namespaceName === 'pg_catalog'
            );
            const jsonType = introspectionResultsByKind.type.find(
              (introspectionType: PgType) =>
                introspectionType.name === 'json' && introspectionType.namespaceName === 'pg_catalog'
            );
            if (!intType || !jsonType) {
              throw new Error('Unable to locate built-in int4/json types');
            }

            constructedTypes[typeId][gisTypeKey] = newWithHooks(
              GraphQLObjectType,
              {
                name: inflection.gisType(type, subtype, hasZ, hasM, srid),
                interfaces: () => [
                  getGisInterface(type),
                  getGisDimensionInterface(type, hasZ, hasM)
                ],
                fields: {
                  [geojsonFieldName]: {
                    type: GeoJSON,
                    resolve: (data: GisFieldValue) => {
                      return pg2gql(data.__geojson, jsonType);
                    }
                  },
                  srid: {
                    type: new GraphQLNonNull(GraphQLInt),
                    resolve: (data: GisFieldValue) => {
                      return pg2gql(data.__srid, intType);
                    }
                  }
                }
              },
              {
                isPgGISType: true,
                pgGISType: type,
                pgGISTypeDetails: typeDetails
              }
            );
          }
        }
        return constructedTypes[typeId][gisTypeKey];
      };

      console.warn(`Registering handler for ${GEOGRAPHY_TYPE.id}`);

      pgRegisterGqlInputTypeByTypeId(GEOGRAPHY_TYPE.id, () => GeoJSON);
      pg2GqlMapper[GEOGRAPHY_TYPE.id] = {
        map: identity,
        unmap: (o: unknown) =>
          sql.fragment`st_geomfromgeojson(${sql.value(
            JSON.stringify(o)
          )}::text)::${sql.identifier(
            POSTGIS?.namespaceName || 'public',
            'geography'
          )}`
      };

      pgRegisterGqlTypeByTypeId(GEOGRAPHY_TYPE.id, (_set: Record<string, unknown>, typeModifier: number) => {
        return getGisType(GEOGRAPHY_TYPE, typeModifier);
      });

      console.warn(`Registering handler for ${GEOMETRY_TYPE.id}`);

      pgRegisterGqlInputTypeByTypeId(GEOMETRY_TYPE.id, () => GeoJSON);
      pg2GqlMapper[GEOMETRY_TYPE.id] = {
        map: identity,
        unmap: (o: unknown) =>
          sql.fragment`st_geomfromgeojson(${sql.value(
            JSON.stringify(o)
          )}::text)`
      };

      pgRegisterGqlTypeByTypeId(GEOMETRY_TYPE.id, (_set: Record<string, unknown>, typeModifier: number) => {
        return getGisType(GEOMETRY_TYPE, typeModifier);
      });
      return input;
    },
    ['PostgisTypes'],
    ['PgTables'],
    ['PgTypes']
  );

  builder.hook('GraphQLSchema', (schemaConfig, build: Build) => {
    const postgisBuild = build as PostgisBuild;
    const existingTypes = schemaConfig.types ?? [];
    return {
      ...schemaConfig,
      types: [...existingTypes, ...postgisBuild.pgGISIncludedTypes]
    } as GraphQLSchemaConfig;
  });
};

export default PostgisRegisterTypesPlugin;
