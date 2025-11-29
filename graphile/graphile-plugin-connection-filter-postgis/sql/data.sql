insert into p.gis_debug (
  geog,

  geog_point,
  geog_linestr,
  geog_poly,
  geog_multipoint,
  geog_multilinestr,
  geog_multipoly,
  geog_geometrycollection,

  geog_pointm,
  geog_linestrm,
  geog_polym,
  geog_multipointm,
  geog_multilinestrm,
  geog_multipolym,
  geog_geometrycollectionm,

  geom,

  geom_point,
  geom_linestr,
  geom_poly,
  geom_multipoint,
  geom_multilinestr,
  geom_multipoly,
  geom_geometrycollection,

  geom_pointm,
  geom_linestrm,
  geom_polym,
  geom_multipointm,
  geom_multilinestrm,
  geom_multipolym,
  geom_geometrycollectionm
) values (
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT (30 10)'),
  ST_GeographyFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeographyFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeographyFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeographyFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeographyFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT M (30 10 99)'),
  ST_GeographyFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeographyFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeographyFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeographyFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeographyFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))'),

  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT (30 10)'),
  ST_GeometryFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeometryFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeometryFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeometryFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeometryFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT M (30 10 99)'),
  ST_GeometryFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeometryFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeometryFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeometryFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeometryFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))')
);