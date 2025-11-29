drop extension if exists postgis cascade;
create extension if not exists postgis with schema public;

drop schema if exists p cascade;
create schema p;

create table p.gis_debug (
  id                        serial primary key,

  ---------------
  -- GEOGRAPHY --
  ---------------

  geog                      geography,

  -- XY
  geog_geometry             geography(geometry),
  geog_point                geography(point),
  geog_linestr              geography(linestring),
  geog_poly                 geography(polygon),
  geog_multipoint           geography(multipoint),
  geog_multilinestr         geography(multilinestring),
  geog_multipoly            geography(multipolygon),
  geog_geometrycollection   geography(geometrycollection),

  -- XYZ
  -- geog_geometryz            geography(geometryz),
  -- geog_pointz               geography(pointz),
  -- geog_linestrz             geography(linestringz),
  -- geog_polyz                geography(polygonz),
  -- geog_multipointz          geography(multipointz),
  -- geog_multilinestrz        geography(multilinestringz),
  -- geog_multipolyz           geography(multipolygonz),
  -- geog_geometrycollectionz  geography(geometrycollectionz),

  -- XYM
  geog_geometrym            geography(geometrym),
  geog_pointm               geography(pointm),
  geog_linestrm             geography(linestringm),
  geog_polym                geography(polygonm),
  geog_multipointm          geography(multipointm),
  geog_multilinestrm        geography(multilinestringm),
  geog_multipolym           geography(multipolygonm),
  geog_geometrycollectionm  geography(geometrycollectionm),

  -- XYZM
  -- geog_geometryzm           geography(geometryzm),
  -- geog_pointzm              geography(pointzm),
  -- geog_linestrzm            geography(linestringzm),
  -- geog_polyzm               geography(polygonzm),
  -- geog_multipointmz         geography(multipointzm),
  -- geog_multilinestrmz       geography(multilinestringzm),
  -- geog_multipolymz          geography(multipolygonzm),
  -- geog_geometrycollectionzm geography(geometrycollectionzm),

  --------------
  -- GEOMETRY --
  --------------

  geom                      geometry,

  -- XY
  geom_geometry             geometry(geometry),
  geom_point                geometry(point),
  geom_linestr              geometry(linestring),
  geom_poly                 geometry(polygon),
  geom_multipoint           geometry(multipoint),
  geom_multilinestr         geometry(multilinestring),
  geom_multipoly            geometry(multipolygon),
  geom_geometrycollection   geometry(geometrycollection),

  -- XYZ
  -- geom_geometryz            geometry(geometryz),
  -- geom_pointz               geometry(pointz),
  -- geom_linestrz             geometry(linestringz),
  -- geom_polyz                geometry(polygonz),
  -- geom_multipointz          geometry(multipointz),
  -- geom_multilinestrz        geometry(multilinestringz),
  -- geom_multipolyz           geometry(multipolygonz),
  -- geom_geometrycollectionz  geometry(geometrycollectionz),

  -- XYM
  geom_geometrym            geometry(geometrym),
  geom_pointm               geometry(pointm),
  geom_linestrm             geometry(linestringm),
  geom_polym                geometry(polygonm),
  geom_multipointm          geometry(multipointm),
  geom_multilinestrm        geometry(multilinestringm),
  geom_multipolym           geometry(multipolygonm),
  geom_geometrycollectionm  geometry(geometrycollectionm)

  -- XYZM
  -- geom_geometryzm           geometry(geometryzm),
  -- geom_pointzm              geometry(pointzm),
  -- geom_linestrzm            geometry(linestringzm),
  -- geom_polyzm               geometry(polygonzm),
  -- geom_multipointzm         geometry(multipointzm),
  -- geom_multilinestrzm       geometry(multilinestringzm),
  -- geom_multipolyzm          geometry(multipolygonzm),
  -- geom_geometrycollectionzm geometry(geometrycollectionzm),
);