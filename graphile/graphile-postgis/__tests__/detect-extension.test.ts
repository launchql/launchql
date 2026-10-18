import { PostgisExtensionDetectionPlugin } from '../src/plugins/detect-extension';

describe('PostgisExtensionDetectionPlugin', () => {
  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(PostgisExtensionDetectionPlugin.name).toBe('PostgisExtensionDetectionPlugin');
    });

    it('should have correct version', () => {
      expect(PostgisExtensionDetectionPlugin.version).toBe('2.0.0');
    });
  });

  describe('build hook', () => {
    const buildHook = (PostgisExtensionDetectionPlugin as any).schema.hooks.build;

    it('should return build unchanged when pgRegistry is missing', () => {
      const build = { input: {} };
      const result = buildHook(build);
      expect(result).toBe(build);
    });

    it('should return build unchanged when no geometry/geography codecs exist', () => {
      const build = {
        input: {
          pgRegistry: {
            pgCodecs: {
              text: { extensions: { pg: { name: 'text', schemaName: 'pg_catalog' } } },
              int4: { extensions: { pg: { name: 'int4', schemaName: 'pg_catalog' } } }
            }
          }
        },
        extend: (base: any, ext: any) => ({ ...base, ...ext })
      };

      const result = buildHook(build);
      expect(result).toBe(build);
    });

    it('should detect PostGIS with only geometry codec (no geography)', () => {
      const geometryCodec = {
        name: 'geometry',
        extensions: { pg: { name: 'geometry', schemaName: 'public', serviceName: 'main' } }
      };
      const build = {
        input: {
          pgRegistry: {
            pgCodecs: {
              geometry: geometryCodec
            }
          }
        },
        extend: (base: any, ext: any, _reason: string) => ({ ...base, ...ext })
      };

      const result = buildHook(build);
      expect(result.pgGISExtensionInfo).toBeDefined();
      expect(result.pgGISExtensionInfo.geometryCodec).toBe(geometryCodec);
      expect(result.pgGISExtensionInfo.geographyCodec).toBeNull();
      expect(result.pgGISExtensionInfo.serviceName).toBe('main');
      expect(result.pgGISExtensionInfo.schemaName).toBe('public');
    });

    it('should detect PostGIS when both geometry and geography codecs exist', () => {
      const geometryCodec = {
        name: 'geometry',
        extensions: { pg: { name: 'geometry', schemaName: 'public', serviceName: 'main' } }
      };
      const geographyCodec = {
        name: 'geography',
        extensions: { pg: { name: 'geography', schemaName: 'public', serviceName: 'main' } }
      };

      const build = {
        input: {
          pgRegistry: {
            pgCodecs: { geometry: geometryCodec, geography: geographyCodec }
          }
        },
        extend: (base: any, ext: any, _reason: string) => ({ ...base, ...ext })
      };

      const result = buildHook(build);
      expect(result.pgGISExtensionInfo).toBeDefined();
      expect(result.pgGISExtensionInfo.schemaName).toBe('public');
      expect(result.pgGISExtensionInfo.geometryCodec).toBe(geometryCodec);
      expect(result.pgGISExtensionInfo.geographyCodec).toBe(geographyCodec);
      expect(result.pgGISGraphQLTypesByCodecAndSubtype).toEqual({});
    });

    it('should detect custom schema for PostGIS installation', () => {
      const geometryCodec = {
        name: 'geometry',
        extensions: { pg: { name: 'geometry', schemaName: 'postgis', serviceName: 'main' } }
      };
      const geographyCodec = {
        name: 'geography',
        extensions: { pg: { name: 'geography', schemaName: 'postgis', serviceName: 'main' } }
      };

      const build = {
        input: {
          pgRegistry: {
            pgCodecs: { geometry: geometryCodec, geography: geographyCodec }
          }
        },
        extend: (base: any, ext: any, _reason: string) => ({ ...base, ...ext })
      };

      const result = buildHook(build);
      expect(result.pgGISExtensionInfo.schemaName).toBe('postgis');
    });

    it('should skip codecs without pg extensions', () => {
      const geometryCodec = {
        name: 'geometry',
        extensions: { pg: { name: 'geometry', schemaName: 'public', serviceName: 'main' } }
      };
      const geographyCodec = {
        name: 'geography',
        extensions: { pg: { name: 'geography', schemaName: 'public', serviceName: 'main' } }
      };
      const otherCodec = {
        name: 'custom',
        extensions: {}
      };

      const build = {
        input: {
          pgRegistry: {
            pgCodecs: {
              geometry: geometryCodec,
              geography: geographyCodec,
              custom: otherCodec
            }
          }
        },
        extend: (base: any, ext: any, _reason: string) => ({ ...base, ...ext })
      };

      const result = buildHook(build);
      expect(result.pgGISExtensionInfo).toBeDefined();
    });

    it('fails closed when codec identity is missing or inconsistent', () => {
      const extend = (base: any, ext: any) => ({ ...base, ...ext });
      expect(() => buildHook({
        input: {
          pgRegistry: {
            pgCodecs: {
              geometry: {
                name: 'geometry',
                extensions: { pg: { name: 'geometry', schemaName: 'postgis' } }
              }
            }
          }
        },
        extend
      })).toThrow(/missing exact service\/schema metadata/);

      expect(() => buildHook({
        input: {
          pgRegistry: {
            pgCodecs: {
              geometry: {
                name: 'geometry',
                extensions: {
                  pg: { name: 'geometry', schemaName: 'postgis_a', serviceName: 'main' }
                }
              },
              geography: {
                name: 'geography',
                extensions: {
                  pg: { name: 'geography', schemaName: 'postgis_b', serviceName: 'main' }
                }
              }
            }
          }
        },
        extend
      })).toThrow(/different service\/schema identities/);
    });
  });
});
