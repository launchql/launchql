/**
 * Unit tests for the object-store credentials (the only storage env input).
 */

async function loadResolverModule(storage: { accessKeyId?: string; secretAccessKey?: string } | undefined) {
  jest.resetModules();

  jest.doMock('@constructive-io/graphql-env', () => ({
    getEnvOptions: jest.fn(() => ({ storage })),
  }));

  return import('../src/presigned-url-resolver');
}

describe('getStorageCredentials', () => {
  it('returns the dedicated storage credentials', async () => {
    const { getStorageCredentials } = await loadResolverModule({
      accessKeyId: 'access',
      secretAccessKey: 'secret',
    });

    expect(getStorageCredentials()).toEqual({ accessKeyId: 'access', secretAccessKey: 'secret' });
  });

  it('fails fast naming both env vars when either is missing', async () => {
    for (const storage of [undefined, { accessKeyId: 'access' }, { secretAccessKey: 'secret' }]) {
      const { getStorageCredentials } = await loadResolverModule(storage);
      expect(() => getStorageCredentials()).toThrow(
        /STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY/,
      );
    }
  });
});
