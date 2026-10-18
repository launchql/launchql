import type { PgCodec } from '@dataplan/pg';
import sql from 'pg-sql2';

import { GisSubtype } from '../src/constants';
import { PostgisCodecPlugin } from '../src/plugins/codec';
import type { GisFieldValue } from '../src/types';
import { getGISTypeModifier } from '../src/utils';

// Test event shape matching the GatherHooks.pgCodecs_findPgCodec event
interface MockEvent {
  pgCodec: PgCodec | null;
  pgType: { typname: string; typnamespace?: string; _id?: string };
  serviceName: string;
}

describe('PostgisCodecPlugin', () => {
  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(PostgisCodecPlugin.name).toBe('PostgisCodecPlugin');
    });

    it('should have correct version', () => {
      expect(PostgisCodecPlugin.version).toBe('2.0.0');
    });
  });

  describe('gather hook', () => {
    const gatherHook = (PostgisCodecPlugin as { gather: { hooks: { pgCodecs_findPgCodec: Function } } })
      .gather.hooks.pgCodecs_findPgCodec;

    it('should bind exact identity when a native pgCodec is already set', async () => {
      const info = {
        helpers: {
          pgIntrospection: {
            getNamespace: jest.fn().mockResolvedValue({ _id: '123', nspname: 'postgis_ext' })
          }
        }
      };
      const event = {
        pgCodec: { name: 'geometry' } as PgCodec,
        pgType: { typname: 'geometry', typnamespace: '123', _id: '456' },
        serviceName: 'main'
      };
      const originalCodec = event.pgCodec;

      await gatherHook(info, event);
      expect(event.pgCodec).toBe(originalCodec);
      expect(info.helpers.pgIntrospection.getNamespace).toHaveBeenCalledWith('main', '123');
      expect(event.pgCodec.extensions?.pg).toEqual({
        serviceName: 'main',
        schemaName: 'postgis_ext',
        name: 'geometry'
      });
      expect(sql.compile(event.pgCodec.sqlType!).text).toBe('"postgis_ext"."geometry"');
    });

    it('should fail closed if namespace is not found', async () => {
      const info = {
        helpers: { pgIntrospection: { getNamespace: jest.fn().mockResolvedValue(null) } }
      };
      const event: MockEvent = {
        pgCodec: null,
        pgType: { typname: 'geometry', typnamespace: '123' },
        serviceName: 'main'
      };

      await expect(gatherHook(info, event)).rejects.toThrow(
        /Cannot resolve namespace for geometry codec/
      );
    });

    it('should create geometry codec when type is geometry', async () => {
      const info = {
        helpers: {
          pgIntrospection: {
            getNamespace: jest.fn().mockResolvedValue({ _id: '123', nspname: 'public' })
          }
        }
      };
      const event: MockEvent = {
        pgCodec: null,
        pgType: { typname: 'geometry', typnamespace: '123', _id: '456' },
        serviceName: 'main'
      };

      await gatherHook(info, event);

      expect(event.pgCodec).toBeDefined();
      expect(event.pgCodec!.name).toBe('geometry');
      expect(event.pgCodec!.extensions?.pg?.name).toBe('geometry');
      expect(event.pgCodec!.extensions?.pg?.schemaName).toBe('public');
      expect(event.pgCodec!.extensions?.pg?.serviceName).toBe('main');
      expect(event.pgCodec!.extensions?.oid).toBe('456');
    });

    it('should create geography codec when type is geography', async () => {
      const info = {
        helpers: {
          pgIntrospection: {
            getNamespace: jest.fn().mockResolvedValue({ _id: '789', nspname: 'postgis' })
          }
        }
      };
      const event: MockEvent = {
        pgCodec: null,
        pgType: { typname: 'geography', typnamespace: '789', _id: '101' },
        serviceName: 'main'
      };

      await gatherHook(info, event);

      expect(event.pgCodec).toBeDefined();
      expect(event.pgCodec!.name).toBe('geography');
      expect(event.pgCodec!.extensions?.pg?.name).toBe('geography');
      expect(event.pgCodec!.extensions?.pg?.schemaName).toBe('postgis');
    });

    it('should skip non-geometry/geography types', async () => {
      const info = {
        helpers: {
          pgIntrospection: {
            getNamespace: jest.fn().mockResolvedValue({ _id: '123', nspname: 'public' })
          }
        }
      };
      const event: MockEvent = {
        pgCodec: null,
        pgType: { typname: 'text', typnamespace: '123', _id: '200' },
        serviceName: 'main'
      };

      await gatherHook(info, event);
      expect(event.pgCodec).toBeNull();
    });

    it('should pass correct args to getNamespace', async () => {
      const getNamespace = jest.fn().mockResolvedValue({ _id: '123', nspname: 'public' });
      const info = { helpers: { pgIntrospection: { getNamespace } } };
      const event: MockEvent = {
        pgCodec: null,
        pgType: { typname: 'geometry', typnamespace: '123', _id: '456' },
        serviceName: 'main'
      };

      await gatherHook(info, event);
      expect(getNamespace).toHaveBeenCalledWith('main', '123');
    });

    describe('fromPg', () => {
      let fromPg: (value: string) => GisFieldValue;

      beforeAll(async () => {
        const info = {
          helpers: {
            pgIntrospection: {
              getNamespace: jest.fn().mockResolvedValue({ _id: '1', nspname: 'public' })
            }
          }
        };
        const event = {
          pgCodec: null as unknown,
          pgType: { typname: 'geometry', typnamespace: '1', _id: '10' },
          serviceName: 'main'
        };
        await gatherHook(info, event);
        fromPg = (event.pgCodec as { fromPg: typeof fromPg }).fromPg;
      });

      it('should parse JSON string values', () => {
        const jsonStr = JSON.stringify({
          __gisType: 'Point',
          __srid: 4326,
          __geojson: { type: 'Point', coordinates: [1, 2] }
        });
        const result = fromPg(jsonStr);
        expect(result.__gisType).toBe('Point');
        expect(result.__srid).toBe(4326);
      });

      it('should normalize uppercase gisType to mixed case', () => {
        const jsonStr = JSON.stringify({
          __gisType: 'MULTIPOLYGON',
          __srid: 4326,
          __geojson: { type: 'MultiPolygon', coordinates: [] }
        });
        const result = fromPg(jsonStr);
        expect(result.__gisType).toBe('MultiPolygon');
      });

      it('should pass through already-normalized gisType', () => {
        const jsonStr = JSON.stringify({
          __gisType: 'LineString',
          __srid: 4326,
          __geojson: { type: 'LineString', coordinates: [] }
        });
        const result = fromPg(jsonStr);
        expect(result.__gisType).toBe('LineString');
      });

      it('should throw on invalid JSON (castFromPg guarantees valid JSON)', () => {
        expect(() => fromPg('not-json')).toThrow();
      });
    });

    describe('toPg', () => {
      let toPg: (value: GisFieldValue) => string;

      beforeAll(async () => {
        const info = {
          helpers: {
            pgIntrospection: {
              getNamespace: jest.fn().mockResolvedValue({ _id: '1', nspname: 'public' })
            }
          }
        };
        const event = {
          pgCodec: null as unknown,
          pgType: { typname: 'geometry', typnamespace: '1', _id: '10' },
          serviceName: 'main'
        };
        await gatherHook(info, event);
        toPg = (event.pgCodec as { toPg: typeof toPg }).toPg;
      });

      it('should JSON.stringify GeoJSON objects', () => {
        const geojson = { type: 'Point', coordinates: [1, 2] } as unknown as GisFieldValue;
        const result = toPg(geojson);
        expect(result).toBe(JSON.stringify(geojson));
      });

      it('should extract __geojson from GisFieldValue objects', () => {
        const value: GisFieldValue = {
          __gisType: 'Point',
          __srid: 4326,
          __geojson: { type: 'Point', coordinates: [1, 2] }
        };
        const result = toPg(value);
        const parsed = JSON.parse(result);
        expect(parsed.type).toBe('Point');
        expect(parsed.coordinates).toEqual([1, 2]);
        expect(parsed.__gisType).toBeUndefined();
      });
    });

    describe('castFromPg', () => {
      it('should be defined on the codec', async () => {
        const info = {
          helpers: {
            pgIntrospection: {
              getNamespace: jest.fn().mockResolvedValue({ _id: '1', nspname: 'public' })
            }
          }
        };
        const event = {
          pgCodec: null as unknown,
          pgType: { typname: 'geometry', typnamespace: '1', _id: '10' },
          serviceName: 'main'
        };
        await gatherHook(info, event);

        const codec = event.pgCodec as { castFromPg?: Function };
        expect(codec.castFromPg).toBeDefined();
        expect(typeof codec.castFromPg).toBe('function');
      });
    });
  });

  describe('pgCodecs_attribute hook', () => {
    const attributeHook = (PostgisCodecPlugin as { gather: { hooks: { pgCodecs_attribute: Function } } })
      .gather.hooks.pgCodecs_attribute;

    async function runAttributeHook({
      codecName,
      typmod,
      withExtensions = true,
    }: {
      codecName: string;
      typmod: number | null;
      withExtensions?: boolean;
    }) {
      const attribute: Record<string, any> = { codec: { name: codecName } };
      if (withExtensions) {
        attribute.extensions = {};
      }
      const event = { pgAttribute: { atttypmod: typmod }, attribute };

      await attributeHook({}, event);
      return attribute;
    }

    it.each([
      ['geometry', GisSubtype.Polygon, 'Polygon'],
      ['geometry', GisSubtype.Point, 'Point'],
      ['geography', GisSubtype.MultiPolygon, 'MultiPolygon'],
    ])('stores geometrySubtype for %s subtype %s', async (codecName, subtype, expected) => {
      const attribute = await runAttributeHook({
        codecName,
        typmod: getGISTypeModifier(subtype, false, false, 4326),
      });

      expect(attribute.extensions.geometrySubtype).toBe(expected);
    });

    it('should skip unconstrained geometry (atttypmod = -1)', async () => {
      const attribute = await runAttributeHook({
        codecName: 'geometry',
        typmod: -1,
      });
      expect(attribute.extensions.geometrySubtype).toBeUndefined();
    });

    it('should skip when atttypmod is null', async () => {
      const attribute = await runAttributeHook({
        codecName: 'geometry',
        typmod: null,
      });
      expect(attribute.extensions.geometrySubtype).toBeUndefined();
    });

    it('should not store subtype for base Geometry (subtype=0)', async () => {
      const attribute = await runAttributeHook({
        codecName: 'geometry',
        typmod: getGISTypeModifier(GisSubtype.Geometry, false, false, 4326),
      });
      expect(attribute.extensions.geometrySubtype).toBeUndefined();
    });

    it('should skip non-geometry codec types', async () => {
      const attribute = await runAttributeHook({
        codecName: 'text',
        typmod: getGISTypeModifier(GisSubtype.Point, false, false, 4326),
      });
      expect(attribute.extensions.geometrySubtype).toBeUndefined();
    });

    it('should create extensions object if not present', async () => {
      const attribute = await runAttributeHook({
        codecName: 'geometry',
        typmod: getGISTypeModifier(GisSubtype.LineString, false, false, 4326),
        withExtensions: false,
      });
      expect(attribute.extensions).toBeDefined();
      expect(attribute.extensions.geometrySubtype).toBe('LineString');
    });
  });
});
