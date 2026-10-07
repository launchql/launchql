import { resolveS3ForDatabase } from '../src/physical-bucket';
import type { PresignedUrlPluginOptions, StorageModuleConfig } from '../src/types';

const options = {
  credentials: { accessKeyId: 'platform-key', secretAccessKey: 'platform-secret' },
} as PresignedUrlPluginOptions;

const config = (overrides: Partial<StorageModuleConfig> = {}): StorageModuleConfig =>
  ({
    id: 'sm-1',
    scope: 'app',
    endpoint: 'https://objects.example.com',
    publicUrlPrefix: null,
    provider: 'minio',
    region: 'us-east-1',
    connectionOverrides: [],
    ...overrides,
  }) as StorageModuleConfig;

describe('resolveS3ForDatabase', () => {
  it('signs against the platform plane connection', () => {
    const s3 = resolveS3ForDatabase(options, config(), 'physical-bucket');
    expect(s3).toMatchObject({
      bucket: 'physical-bucket',
      region: 'us-east-1',
      endpoint: 'https://objects.example.com',
      forcePathStyle: true,
    });
  });

  it('refuses a module row that names its own endpoint for the platform credentials', () => {
    expect(() =>
      resolveS3ForDatabase(options, config({ connectionOverrides: ['endpoint', 'region'] }), 'physical-bucket'),
    ).toThrow('STORAGE_CONNECTION_OVERRIDE_REFUSED: storage module sm-1 (scope app) sets its own endpoint, region');
  });

  it('refuses a connection the platform plane has not configured', () => {
    expect(() => resolveS3ForDatabase(options, config({ provider: null }), 'physical-bucket')).toThrow(
      'STORAGE_CONNECTION_NOT_CONFIGURED',
    );
  });
});
